import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { CompositePdfEngine } from "../../../core-pdf-reader/src/engine/CompositePdfEngine.js";
import type { IFontInformation } from "../../../core-pdf-reader/src/IFontInformation.js";
import { DbscanPdfBoundingBoxClusterer } from "../../src/DbscanPdfBoundingBoxClusterer.js";
import type { IPdfBoundingBox } from "../../src/IPdfBoundingBox.js";

const thisDirectory = dirname(fileURLToPath(import.meta.url));
const kiwiPdfPath = join(thisDirectory, "Kiwi.pdf");
const outputJsonPath = join(thisDirectory, "Kiwi.dbscan.clusters.json");

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
  readonly box: IPdfBoundingBox;
  readonly metadata: IBoundingBoxMetadata;
}

interface ISerializableBoundingBox extends IPdfBoundingBox {
  readonly metadata: IBoundingBoxMetadata | null;
}

interface IPageSelection {
  readonly raw: string;
  readonly startPage: number;
  readonly endPage: number;
}

function toBoundingBox(fragment: ITextFragmentLike, index: number): IPdfBoundingBox {
  const width = Math.max(fragment.width, 0);
  const height = Math.max(fragment.height, 0);
  const minX = fragment.x;
  const minY = fragment.y;
  const maxX = minX + width;
  const maxY = minY + height;

  return {
    id: `p${fragment.pageNumber}-${index}`,
    minX,
    minY,
    maxX,
    maxY,
    width,
    height,
  };
}

function toBoxRecord(fragment: ITextFragmentLike, index: number): IBoxRecord {
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
      centerX: box.minX + box.width / 2,
      centerY: box.minY + box.height / 2,
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
  box: IPdfBoundingBox,
  metadataById: ReadonlyMap<string, IBoundingBoxMetadata>,
): ISerializableBoundingBox {
  return {
    id: box.id,
    minX: box.minX,
    minY: box.minY,
    maxX: box.maxX,
    maxY: box.maxY,
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
    const endToken = rangeMatch[2]!;
    const endPage = endToken === "all" ? maxPage : Number(endToken);

    if (Number.isInteger(startPage) && Number.isInteger(endPage) && startPage >= 1 && endPage >= startPage) {
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
    const binary = new Uint8Array(readFileSync(kiwiPdfPath));
    const engine = new CompositePdfEngine();
    const textFragments = await engine.readTextFragments(binary);
    const maxPage = textFragments.reduce(
      (currentMax, fragment) => Math.max(currentMax, fragment.pageNumber),
      1,
    );
    const pageSelection = parsePageSelection(process.env.KIWI_PAGE_RANGE ?? "1", maxPage);
    const selectedTextFragments = textFragments.filter(
      (fragment) =>
        fragment.pageNumber >= pageSelection.startPage &&
        fragment.pageNumber <= pageSelection.endPage,
    );

    const records = selectedTextFragments
      .filter((fragment) => fragment.text.trim().length > 0)
      .map((fragment, index) => toBoxRecord(fragment, index));
    const boxes = records.map((record) => record.box);
    const metadataById = new Map(
      records.map((record) => [record.box.id, record.metadata] as const),
    );

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
        mode: pageSelection.startPage === pageSelection.endPage ? "single-page" : "range",
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
        (fragment) => typeof fragment.fontSize === "number" && fragment.fontSize > 0,
      ),
    ).toBe(true);
    expect(boxes.length).toBeGreaterThan(0);
    expect(
      clustering.clusters.reduce((sum, cluster) => sum + cluster.items.length, 0) +
        clustering.noise.length,
    ).toBe(boxes.length);
    expect(existsSync(outputJsonPath)).toBe(true);
  });
});
