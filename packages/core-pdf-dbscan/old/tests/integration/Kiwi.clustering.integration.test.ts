import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";
import { CompositePdfEngine } from "../../../core-pdf-reader/src/old/engine/CompositePdfEngine.js";
import type { IPdfTextFragment } from "../../../core-pdf-reader/src/old/IPdfTextFragment.js";
import { DbscanPdfBoundingBoxClusterer } from "../../../src/DbscanPdfBoundingBoxClusterer.js";

const thisDirectory = dirname(fileURLToPath(import.meta.url));
const kiwiPdfPath = join(thisDirectory, "Kiwi.pdf");
const outputJsonPath = join(thisDirectory, "Kiwi.dbscan.clusters.json");

interface IBoundingBoxMetadata {
  readonly pageNumber: number;
  readonly fragmentIndex: number;
  readonly text: string;
  readonly textLength: number;
  readonly area: number;
  readonly centerX: number;
  readonly centerY: number;
  readonly aspectRatio: number;
  readonly fontInformation: IFontInformation | null;
  readonly fontName: string | null;
  readonly fontFamily: string | null;
  readonly fontSize: number | null;
}

interface IBoxRecord {
  readonly box: IBoundingBox;
  readonly metadata: IBoundingBoxMetadata;
}

interface ISerializableBoundingBox extends IBoundingBox {
  readonly metadata: IBoundingBoxMetadata | null;
}

interface IPageSelection {
  readonly raw: string;
  readonly startPage: number;
  readonly endPage: number;
}

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
      `Invalid text fragment bounds at page ${fragment.pageNumber}, index ${index}.`,
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

function toBoxRecord(fragment: IPdfTextFragment, index: number): IBoxRecord {
  const box = toBoundingBox(fragment, index);
  const area = box.width * box.height;

  return {
    box,
    metadata: {
      pageNumber: fragment.pageNumber,
      fragmentIndex: index,
      text: fragment.text,
      textLength: fragment.text.length,
      area,
      centerX: box.min.x + box.width / 2,
      centerY: box.min.y + box.height / 2,
      aspectRatio: box.height === 0 ? 0 : box.width / box.height,
      fontInformation: fragment.font ?? null,
      fontName: fragment.fontName ?? null,
      fontFamily: fragment.fontFamily ?? null,
      fontSize:
        typeof fragment.fontSize === "number" && Number.isFinite(fragment.fontSize)
          ? fragment.fontSize
          : null,
    },
  };
}

function toSerializableBoundingBox(
  box: IBoundingBox,
  metadataById: ReadonlyMap<string, IBoundingBoxMetadata>,
): ISerializableBoundingBox {
  return {
    id: box.id,
    min: {
      x: box.min.x,
      y: box.min.y,
    },
    max: {
      x: box.max.x,
      y: box.max.y,
    },
    width: box.width,
    height: box.height,
    metadata: metadataById.get(box.id) ?? null,
  };
}

function parsePageSelection(rawInput: string, maxPage: number): IPageSelection {
  const normalized = rawInput.trim().toLowerCase();

  if (normalized === "" || normalized === "1") {
    return {
      raw: rawInput,
      startPage: 1,
      endPage: 1,
    };
  }

  const rangeMatch = normalized.match(/^(\d+)\.\.(\d+|all)$/i);

  if (rangeMatch) {
    const startPage = Number(rangeMatch[1]);
    const endToken = rangeMatch[2];
    const endPage = endToken === "all" ? maxPage : Number(endToken);

    if (
      Number.isInteger(startPage) &&
      Number.isInteger(endPage) &&
      startPage >= 1 &&
      endPage >= startPage
    ) {
      return {
        raw: rawInput,
        startPage,
        endPage,
      };
    }
  }

  throw new Error(
    `Invalid KIWI_PAGE_RANGE: "${rawInput}". Use "1" (default) or "1..all".`,
  );
}

describe("Kiwi PDF clustering integration", () => {
  it("reads Kiwi.pdf and writes DBSCAN clustering JSON in the same folder", async () => {
    expect(existsSync(kiwiPdfPath)).toBe(true);

    const binary = new Uint8Array(readFileSync(kiwiPdfPath));
    const engine = new CompositePdfEngine();
    const textFragments = await engine.readTextFragments(binary);

    const maxPage = textFragments.reduce(
      (currentMax, fragment) => Math.max(currentMax, fragment.pageNumber),
      1,
    );

    const pageSelection = parsePageSelection(
      process.env.KIWI_PAGE_RANGE ?? "1",
      maxPage,
    );

    const selectedTextFragments = textFragments.filter(
      (fragment) =>
        fragment.pageNumber >= pageSelection.startPage &&
        fragment.pageNumber <= pageSelection.endPage,
    );

    const records = selectedTextFragments
      .filter((fragment) => fragment.text.trim().length > 0)
      .map((fragment, index) => toBoxRecord(fragment, index));

    const boxes = records.map((record) => record.box);
    const metadataById = new Map<string, IBoundingBoxMetadata>(
      records.map((record) => [record.box.id, record.metadata]),
    );

    for (const box of boxes) {
      if (
        !Number.isFinite(box.min.x) ||
        !Number.isFinite(box.min.y) ||
        !Number.isFinite(box.max.x) ||
        !Number.isFinite(box.max.y) ||
        !Number.isFinite(box.width) ||
        !Number.isFinite(box.height)
      ) {
        throw new Error(
          `Invalid box detected for id '${box.id}' min=(${String(box.min.x)}, ${String(box.min.y)}) max=(${String(box.max.x)}, ${String(box.max.y)}) width=${String(box.width)} height=${String(box.height)}.`,
        );
      }
    }

    expect(boxes.length).toBeGreaterThan(0);

    const clusterer = new DbscanPdfBoundingBoxClusterer();
    const clustering = clusterer.cluster(boxes, 4, 2);
    const clusterIdByBoxId = new Map<string, string>();

    for (const cluster of clustering.clusters) {
      for (const item of cluster.items) {
        clusterIdByBoxId.set(item.id, cluster.id);
      }
    }

    const payload = {
      sourcePdf: "Kiwi.pdf",
      generatedAt: new Date().toISOString(),
      pageSelection: {
        raw: pageSelection.raw,
        startPage: pageSelection.startPage,
        endPage: pageSelection.endPage,
        mode:
          pageSelection.startPage === pageSelection.endPage
            ? "single-page"
            : "range",
      },
      parameters: {
        eps: 4,
        minPts: 2,
      },
      totals: {
        allPdfFragments: textFragments.length,
        selectedFragments: selectedTextFragments.length,
        clusteredInputBoxes: boxes.length,
        clusters: clustering.clusters.length,
        noise: clustering.noise.length,
      },
      clusters: clustering.clusters.map((cluster) => ({
        id: cluster.id,
        size: cluster.items.length,
        memberBoxIds: cluster.items.map((item) => item.id),
        boundingBoxes: cluster.items.map((item) =>
          toSerializableBoundingBox(item, metadataById),
        ),
      })),
      noise: clustering.noise.map((item) =>
        toSerializableBoundingBox(item, metadataById),
      ),
      boundingBoxes: boxes.map((box) => ({
        ...toSerializableBoundingBox(box, metadataById),
        relationship: {
          clusterId: clusterIdByBoxId.get(box.id) ?? null,
          isNoise: !clusterIdByBoxId.has(box.id),
        },
      })),
      relationships: {
        clusterMembership: boxes.map((box) => ({
          boundingBoxId: box.id,
          clusterId: clusterIdByBoxId.get(box.id) ?? null,
          isNoise: !clusterIdByBoxId.has(box.id),
        })),
      },
    };

    writeFileSync(outputJsonPath, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");

    expect(textFragments.length).toBeGreaterThan(0);
    expect(selectedTextFragments.length).toBeGreaterThan(0);
    expect(
      selectedTextFragments.some(
        (fragment) =>
          typeof fragment.fontSize === "number" && fragment.fontSize > 0,
      ),
    ).toBe(true);
    expect(
      clustering.clusters.reduce((sum, cluster) => sum + cluster.items.length, 0) +
        clustering.noise.length,
    ).toBe(boxes.length);
    expect(existsSync(outputJsonPath)).toBe(true);
  });
});