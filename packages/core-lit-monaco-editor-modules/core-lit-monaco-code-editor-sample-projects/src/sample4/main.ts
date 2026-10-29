import {
  CompositePdfEngine,
  InMemoryPdfBinarySource,
  PdfReader,
} from "@monorepo/core-pdf-reader";
import { DbscanPdfFragmentClusterer } from "@monorepo/core-pdf-dbscan";
import { PdfWriter } from "@monorepo/core-pdf-writer";
import { PdfFragmentWriter } from "@monorepo/core-pdf-parser-adapter";
import { FragmentKinds, type IPdfFragment, type IPdfTextFragment } from "@monorepo/core-pdf-domain";
import "@monorepo/core-pdf-presenter";

type Box = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

const fileInput = document.querySelector<HTMLInputElement>("#pdf-file");
const epsilonInput = document.querySelector<HTMLInputElement>("#epsilon");
const minPointsInput = document.querySelector<HTMLInputElement>("#min-points");
const minClusterItemsInput = document.querySelector<HTMLInputElement>("#min-cluster-items");
const maxClustersInput = document.querySelector<HTMLInputElement>("#max-clusters");
const paddingInput = document.querySelector<HTMLInputElement>("#bbox-padding");
const statusElement = document.querySelector<HTMLElement>("#status");
const statsElement = document.querySelector<HTMLElement>("#stats");
const downloadLink = document.querySelector<HTMLAnchorElement>("#download-link");
const presenter = document.querySelector<HTMLElement & { src?: string }>("#pdf-result");

if (
  !fileInput ||
  !epsilonInput ||
  !minPointsInput ||
  !minClusterItemsInput ||
  !maxClustersInput ||
  !paddingInput ||
  !statusElement ||
  !statsElement ||
  !downloadLink ||
  !presenter
) {
  throw new Error("Sample 4 UI was not rendered correctly.");
}

const reader = new PdfReader(new CompositePdfEngine());
const clusterer = new DbscanPdfFragmentClusterer();
const writer = new PdfWriter<IPdfFragment>(new PdfFragmentWriter());

let sourceName = "";
let sourceBinary: Uint8Array | null = null;
let sourceFragments: readonly IPdfFragment[] = [];
let currentRenderedUrl = "";

const setStatus = (value: string): void => {
  statusElement.textContent = value;
};

const setStats = (value: string): void => {
  statsElement.textContent = value;
};

const toNumber = (value: string, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const disposeCurrentUrl = (): void => {
  if (!currentRenderedUrl) {
    return;
  }

  URL.revokeObjectURL(currentRenderedUrl);
  currentRenderedUrl = "";
};

const computeBoundingBox = (items: readonly IPdfFragment[], padding: number): Box => {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const item of items) {
    const box = item.boundingBox;
    minX = Math.min(minX, box.position.x);
    minY = Math.min(minY, box.position.y);
    maxX = Math.max(maxX, box.position.x + box.width);
    maxY = Math.max(maxY, box.position.y + box.height);
  }

  const safePadding = Math.max(0, padding);

  return {
    x: minX - safePadding,
    y: minY - safePadding,
    width: Math.max(0.5, maxX - minX + safePadding * 2),
    height: Math.max(0.5, maxY - minY + safePadding * 2),
  };
};

const createClusterRectangleFragments = (
  clusters: readonly { readonly id: string; readonly items: readonly IPdfFragment[] }[],
  minClusterItems: number,
  maxClusters: number,
  padding: number,
): readonly IPdfFragment[] => {
  const limitedClusters = clusters
    .filter((cluster) => cluster.items.length >= minClusterItems)
    .slice(0, Math.max(0, maxClusters));

  return limitedClusters.map((cluster) => {
    const pageNumber = cluster.items[0]?.pageNumber ?? 1;
    const box = computeBoundingBox(cluster.items, padding);

    return {
      kind: FragmentKinds.Rectangle,
      pageNumber,
      boundingBox: {
        position: {
          x: box.x,
          y: box.y,
        },
        width: box.width,
        height: box.height,
      },
    } as IPdfFragment;
  });
};

const renderOverlayPdf = async (): Promise<void> => {
  if (!sourceBinary || sourceFragments.length === 0) {
    setStatus("Load a PDF file first.");
    return;
  }

  const epsilon = toNumber(epsilonInput.value, 14);
  const minPoints = Math.max(1, Math.floor(toNumber(minPointsInput.value, 4)));
  const minClusterItems = Math.max(1, Math.floor(toNumber(minClusterItemsInput.value, 3)));
  const maxClusters = Math.max(1, Math.floor(toNumber(maxClustersInput.value, 30)));
  const bboxPadding = Math.max(0, toNumber(paddingInput.value, 2));

  setStatus("Running DBSCAN and writing PDF...");

  const textLikeFragments = sourceFragments.filter(
    (fragment): fragment is IPdfTextFragment => fragment.kind === FragmentKinds.Text,
  );
  const result = clusterer.cluster(textLikeFragments, epsilon, minPoints);

  const rectangleFragments = createClusterRectangleFragments(
    result.clusters,
    minClusterItems,
    maxClusters,
    bboxPadding,
  );

  const outputBinary = await writer.write(sourceBinary, rectangleFragments);

  disposeCurrentUrl();
  currentRenderedUrl = URL.createObjectURL(new Blob([new Uint8Array(outputBinary)], { type: "application/pdf" }));

  presenter.src = currentRenderedUrl;
  downloadLink.href = currentRenderedUrl;
  downloadLink.download = `${sourceName.replace(/\.pdf$/i, "")}.clustered.pdf`;

  setStats(
    [
      `source fragments: ${sourceFragments.length}`,
      `text fragments: ${textLikeFragments.length}`,
      `clusters: ${result.clusters.length}`,
      `noise: ${result.noise.length}`,
      `rendered rectangles: ${rectangleFragments.length}`,
      `epsilon: ${epsilon}`,
      `minPoints: ${minPoints}`,
      `minClusterItems: ${minClusterItems}`,
      `maxClusters: ${maxClusters}`,
      `bboxPadding: ${bboxPadding}`,
    ].join(" | "),
  );

  setStatus("Rendered clustered overlay PDF.");
};

fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.item(0);

  if (!file) {
    setStatus("No PDF selected.");
    return;
  }

  setStatus("Reading fragments from PDF...");

  const binary = new Uint8Array(await file.arrayBuffer());
  const source = new InMemoryPdfBinarySource(file.name, binary);

  sourceName = file.name;
  sourceBinary = binary;
  sourceFragments = await reader.readFragments(source);

  await renderOverlayPdf();
});

const parameterInputs = [
  epsilonInput,
  minPointsInput,
  minClusterItemsInput,
  maxClustersInput,
  paddingInput,
];

for (const input of parameterInputs) {
  input.addEventListener("input", () => {
    if (!sourceBinary) {
      return;
    }

    void renderOverlayPdf();
  });
}
