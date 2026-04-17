/**
 * Integration test: merge neighbouring DBSCAN clusters into a single bounding box.
 *
 * After the standard DBSCAN pass (eps=4, minPts=2) each cluster represents one
 * product region (e.g. "PIZZA GRANDIOSA", "SVIN YTREFILET", "BROKKOLI").
 * A second pass computes one *envelope* bounding box per cluster, then merges
 * envelopes that are within `mergeEps` of each other (Euclidean gap distance).
 *
 * Output: Kiwi.cluster-merge.json
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { CompositePdfEngine } from "../../../core-pdf-reader/src/old/engine/CompositePdfEngine.js";
import type { IFontInformation } from "../../../core-pdf-reader/src/old/IFontInformation.js";
import { DbscanPdfBoundingBoxClusterer } from "../../../src/DbscanPdfBoundingBoxClusterer.js";

import { IPdfTextFragment } from "core-pdf-reader/src/old/sources/IPdfTextFragment.js";
// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const thisDirectory = dirname(fileURLToPath(import.meta.url));
const kiwiPdfPath = join(thisDirectory, "Kiwi.pdf");
const outputJsonPath = join(thisDirectory, "Kiwi.cluster-merge.json");

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

interface ITextFragmentLike {
  readonly pageNumber: number;
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly font?: IFontInformation;
  readonly fontName?: string;
  readonly fontFamily?: string;
  readonly fontSize?: number;
}

interface IFragmentDetails {
  readonly text: string;
  readonly fontInformation: IFontInformation | null;
  readonly fontName: string | null;
  readonly fontFamily: string | null;
  readonly fontSize: number | null;
}

interface IEnvelope {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
  readonly width: number;
  readonly height: number;
}

interface IClusterSummary {
  readonly id: string;
  readonly size: number;
  readonly envelope: IEnvelope;
  readonly items: ReadonlyArray<IBoundingBox & IFragmentDetails>;
}

interface IMergedGroup {
  readonly id: string;
  readonly clusterIds: readonly string[];
  readonly totalItems: number;
  readonly envelope: IEnvelope;
  readonly clusters: readonly IClusterSummary[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type TReaderBoundingBox =
  | {
      readonly min: { readonly x: number; readonly y: number };
      readonly max: { readonly x: number; readonly y: number };
      readonly width: number;
      readonly height: number;
    }
  | {
      readonly position: { readonly x: number; readonly y: number };
      readonly width: number;
      readonly height: number;
    };

function hasMinMax(
  value: TReaderBoundingBox,
): value is Extract<TReaderBoundingBox, { readonly min: unknown; readonly max: unknown }> {
  return "min" in value && "max" in value;
}

function toBoundingBox(fragment: IPdfTextFragment, index: number): IBoundingBox {
  const bb = fragment.boundingBox as unknown as TReaderBoundingBox;

  const width = Math.max(bb.width, 0);
  const height = Math.max(bb.height, 0);

  const minX = hasMinMax(bb) ? bb.min.x : bb.position.x;
  const minY = hasMinMax(bb) ? bb.min.y : bb.position.y;
  const maxX = hasMinMax(bb) ? bb.max.x : minX + width;
  const maxY = hasMinMax(bb) ? bb.max.y : minY + height;

  if (
    !Number.isFinite(minX) ||
    !Number.isFinite(minY) ||
    !Number.isFinite(maxX) ||
    !Number.isFinite(maxY) ||
    !Number.isFinite(width) ||
    !Number.isFinite(height)
  ) {
    throw new Error(
      `Invalid fragment bounds at page ${fragment.pageNumber}, index ${index}.`,
    );
  }

  return {
    id: `p${fragment.pageNumber}-${index}`,
    min: { x: minX, y: minY },
    max: { x: maxX, y: maxY },
    width,
    height,
  };
}
function computeEnvelope(boxes: readonly IBoundingBox[]): IEnvelope {
  if (boxes.length === 0) {
    throw new Error("Cannot compute envelope for an empty bounding box collection.");
  }

  const minX = Math.min(...boxes.map((b) => b.min.x));
  const minY = Math.min(...boxes.map((b) => b.min.y));
  const maxX = Math.max(...boxes.map((b) => b.max.x));
  const maxY = Math.max(...boxes.map((b) => b.max.y));

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Minimum Euclidean gap distance between two axis-aligned bounding boxes.
 * Returns 0 when the boxes overlap or touch.
 */
function bbGapDistance(a: IEnvelope, b: IEnvelope): number {
  const dx = Math.max(0, Math.max(a.minX, b.minX) - Math.min(a.maxX, b.maxX));
  const dy = Math.max(0, Math.max(a.minY, b.minY) - Math.min(a.maxY, b.maxY));
  return Math.sqrt(dx * dx + dy * dy);
}

// ---------------------------------------------------------------------------
// Union-Find for cluster merging
// ---------------------------------------------------------------------------

class UnionFind {
  private readonly parent: number[];
  private readonly rank: number[];

  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, i) => i);
    this.rank = new Array<number>(size).fill(0);
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]!);
    }
    return this.parent[x]!;
  }

  union(x: number, y: number): void {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) return;

    if (this.rank[rootX]! < this.rank[rootY]!) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX]! > this.rank[rootY]!) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]!++;
    }
  }
}

/**
 * Group cluster summaries into merged groups where any two clusters whose
 * envelopes are within `mergeEps` of each other belong to the same group.
 */
function mergeNeighboringClusters(
  clusterSummaries: readonly IClusterSummary[],
  mergeEps: number,
): readonly IMergedGroup[] {
  const uf = new UnionFind(clusterSummaries.length);

  for (let i = 0; i < clusterSummaries.length; i++) {
    for (let j = i + 1; j < clusterSummaries.length; j++) {
      const distance = bbGapDistance(clusterSummaries[i]!.envelope, clusterSummaries[j]!.envelope);
      if (distance <= mergeEps) {
        uf.union(i, j);
      }
    }
  }

  // Group indices by their root
  const groupMap = new Map<number, number[]>();
  for (let i = 0; i < clusterSummaries.length; i++) {
    const root = uf.find(i);
    const group = groupMap.get(root) ?? [];
    group.push(i);
    groupMap.set(root, group);
  }

  const mergedGroups: IMergedGroup[] = [];
  let groupIndex = 0;

  for (const memberIndices of groupMap.values()) {
    const members = memberIndices.map((i) => clusterSummaries[i]!);
    const allBoxes = members.flatMap((c) =>
      c.items.map((item) => item as IBoundingBox),
    );

    mergedGroups.push({
      id: `merged-${groupIndex++}`,
      clusterIds: members.map((c) => c.id),
      totalItems: members.reduce((sum, c) => sum + c.size, 0),
      envelope: computeEnvelope(allBoxes),
      clusters: members,
    });
  }

  return mergedGroups;
}

// ---------------------------------------------------------------------------
// Test
// ---------------------------------------------------------------------------

describe("Kiwi PDF cluster-merge integration", () => {
it("merges neighbouring product clusters into single bounding boxes and writes JSON", async () => {
  const mergeEps = Number(process.env.KIWI_MERGE_EPS ?? 20);

  expect(existsSync(kiwiPdfPath)).toBe(true);

  const binary = new Uint8Array(readFileSync(kiwiPdfPath));
  const engine = new CompositePdfEngine();
  const textFragments = await engine.readTextFragments(binary);

  const detailsById = new Map<string, IFragmentDetails>();
  const boxes: IBoundingBox[] = [];

  for (const fragment of textFragments) {
    if (fragment.text.trim().length === 0) {
      continue;
    }

    const box = toBoundingBox(fragment, boxes.length);

    if (
      !Number.isFinite(box.min.x) ||
      !Number.isFinite(box.min.y) ||
      !Number.isFinite(box.max.x) ||
      !Number.isFinite(box.max.y) ||
      !Number.isFinite(box.width) ||
      !Number.isFinite(box.height)
    ) {
      throw new Error(
        [
          "Invalid Kiwi bounding box detected.",
          `text="${fragment.text}"`,
          `page=${fragment.pageNumber}`,
          `min=(${String(box.min.x)}, ${String(box.min.y)})`,
          `max=(${String(box.max.x)}, ${String(box.max.y)})`,
          `width=${String(box.width)}`,
          `height=${String(box.height)}`,
        ].join(" "),
      );
    }

    boxes.push(box);

    detailsById.set(box.id, {
      text: fragment.text,
      fontInformation: fragment.font ?? null,
      fontName: fragment.fontName ?? null,
      fontFamily: fragment.fontFamily ?? null,
      fontSize:
        typeof fragment.fontSize === "number" && Number.isFinite(fragment.fontSize)
          ? fragment.fontSize
          : null,
    });
  }

  expect(boxes.length).toBeGreaterThan(0);

  const clusterer = new DbscanPdfBoundingBoxClusterer();
  const clustering = clusterer.cluster(boxes, 4, 2);

  const clusterSummaries: IClusterSummary[] = clustering.clusters
    .map((cluster) => ({
      id: cluster.id,
      size: cluster.items.length,
      envelope: computeEnvelope(cluster.items),
      items: cluster.items.map((item) => ({
        ...item,
        ...(detailsById.get(item.id) ?? {
          text: "",
          fontInformation: null,
          fontName: null,
          fontFamily: null,
          fontSize: null,
        }),
      })),
    }))
    .filter((summary) =>
      summary.items.some((item) => item.text.trim().length > 0),
    );

  const mergedGroups = mergeNeighboringClusters(clusterSummaries, mergeEps);

  const payload = {
    sourcePdf: "Kiwi.pdf",
    generatedAt: new Date().toISOString(),
    parameters: {
      eps: 4,
      minPts: 2,
      mergeEps,
    },
    totals: {
      fragments: textFragments.length,
      boxes: boxes.length,
      clusters: clustering.clusters.length,
      clustersWithText: clusterSummaries.length,
      clustersWithoutText: clustering.clusters.length - clusterSummaries.length,
      noise: clustering.noise.length,
      mergedGroups: mergedGroups.length,
    },
    mergedGroups,
  };

  writeFileSync(outputJsonPath, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");

  expect(clustering.clusters.length).toBeGreaterThan(0);
  expect(
    textFragments.some(
      (fragment) => typeof fragment.fontSize === "number" && fragment.fontSize > 0,
    ),
  ).toBe(true);
  expect(mergedGroups.length).toBeGreaterThan(0);
  expect(
    mergedGroups.reduce((sum, group) => sum + group.clusterIds.length, 0),
  ).toBe(clusterSummaries.length);
  expect(existsSync(outputJsonPath)).toBe(true);
});
});
