// vitest.config.ts

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: [
      "tests/**/*.test.ts",
      "tests/**/*.spec.ts",
    ],
    isolate: false,
    pool: "threads",
    typecheck: {
      tsconfig: "./tsconfig.test.json",
    },
    coverage: {
      provider: "v8",
      include: [
        "src/DbscanPdfBoundingBoxClusterer.ts",
        "src/PdfBoundingBox.ts",
        "src/PdfBoundingBoxCluster.ts",
        "src/PdfBoundingBoxClusteringResult.ts",
        "src/PdfBoundingBoxDistance.ts",
        "src/PdfBoundingBoxQueryRegion.ts",
        "src/QuadTreePdfBoundingBoxNeighborhoodQuery.ts",
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
