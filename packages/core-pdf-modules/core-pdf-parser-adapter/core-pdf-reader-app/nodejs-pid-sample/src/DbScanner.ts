// src/DbScanner.ts

import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { DbscanPdfFragmentClusterer } from "@monorepo/core-pdf-dbscan";
import type { PdfFragment } from "@monorepo/core-pdf-domain"

export type DbscanScanResult = ReturnType<DbscanPdfFragmentClusterer["cluster"]>;

export class DbScanner {
  public async scan(
    fragments: readonly PdfFragment[],
    eps: number,
    outputJsonPath: string,
    minSamples: number = 4,
  ): Promise<DbscanScanResult> {
    this.ensureValidInput(fragments, eps, minSamples);

    const clusterer = new DbscanPdfFragmentClusterer();
    const result = clusterer.cluster(fragments, eps, minSamples);

    await mkdir(dirname(outputJsonPath), { recursive: true });

    await writeFile(
      outputJsonPath,
      JSON.stringify(
        {
          eps,
          minSamples,
          fragmentsCount: fragments.length,
          result,
        },
        null,
        2,
      ),
      "utf8",
    );

    console.log(
      JSON.stringify({
        eps,
        minSamples,
        fragmentsCount: fragments.length,
        outputJsonPath,
      }),
    );

    return result;
  }

  private ensureValidInput(
    fragments: readonly PdfFragment[],
    eps: number,
    minSamples: number,
  ): void {
    if (fragments.length === 0) {
      throw new Error("fragments must contain at least one item.");
    }

    if (!Number.isFinite(eps) || eps <= 0) {
      throw new Error("eps must be a finite number > 0.");
    }

    if (!Number.isInteger(minSamples) || minSamples < 2) {
      throw new Error("minSamples must be an integer >= 2.");
    }
  }
}