import type { PdfFragment } from "@monorepo/core-pdf-domain";
import { DbscanPdfFragmentClusterer } from "@monorepo/core-pdf-dbscan";
import { Plot } from "./plot.js";

const fragment = (x: number, y: number): PdfFragment => ({
  kind: "rectangle",
  pageNumber: 1,
  boundingBox: {
    position: { x, y },
    width: 1,
    height: 1,
  },
});

const cross = (translateX: number): readonly PdfFragment[] => [
  fragment(-2 + translateX, 0),
  fragment(0 + translateX, 2),
  fragment(0 + translateX, -2),
  fragment(2 + translateX, 0),
];

const fragments: readonly PdfFragment[] = [
  ...cross(0),
  ...cross(12),
];

const epsilon = 3;
const minPoints = 1;

const result = new DbscanPdfFragmentClusterer().cluster(
  fragments,
  epsilon,
  minPoints,
);

console.log({
  fragmentCount: fragments.length,
  clusterCount: result.clusters.length,
  epsilon,
  minPoints,
});

console.table(
  fragments.map((fragment, index) => ({
    index,
    x: fragment.boundingBox.position.x,
    y: fragment.boundingBox.position.y,
    right: fragment.boundingBox.position.x + fragment.boundingBox.width,
    bottom: fragment.boundingBox.position.y + fragment.boundingBox.height,
  })),
);

const outputPath = new Plot().write(
  "two-groups-eight-fragments.html",
  fragments,
  result.clusters,
);

console.log({ outputPath });