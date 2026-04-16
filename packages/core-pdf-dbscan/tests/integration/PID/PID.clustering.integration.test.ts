import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { CompositePdfEngine } from "../../../../core-pdf-reader/src/engine/CompositePdfEngine.js";
import type { IFontInformation } from "../../../../core-pdf-reader/src/IFontInformation.js";
import { DbscanPdfBoundingBoxClusterer } from "../../../src/DbscanPdfBoundingBoxClusterer.js";
import type { IPdfBoundingBox } from "../../../src/IPdfBoundingBox.js";

const thisDirectory = dirname(fileURLToPath(import.meta.url));
const pidPdfPath = join(thisDirectory, "PID.pdf");
const outputJsonPath = join(thisDirectory, "PID.dbscan.clusters.json");

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

describe("PID PDF clustering integration", () => {
  it("reads PID.pdf, runs DBSCAN, and writes clustering JSON in the same folder", async () => {
    expect(existsSync(pidPdfPath)).toBe(true);

    const binary = new Uint8Array(readFileSync(pidPdfPath));
    const engine = new CompositePdfEngine();
    const textFragments = await engine.readTextFragments(binary);

    const records = textFragments
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
      sourcePdf: "PID.pdf",
      generatedAt: new Date().toISOString(),
      parameters: {
        eps: 4,
        minPts: 2,
      },
      totals: {
        allPdfFragments: textFragments.length,
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
    expect(
      textFragments.some(
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
