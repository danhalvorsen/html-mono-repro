// src/DbscanEpsilonApp.ts

import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { DbscanEpsilonEstimator } from "./DbscanEpsilonEstimator.js";
import { DbScanner } from "./DbScanner.js";
import { PdfFragmentFileReader } from "./PdfFragmentFileReader.js";
import { WritePdf } from "./WritePdf.js";

export class DbscanEpsilonApp {
  public constructor(
    private readonly fragmentReader: PdfFragmentFileReader,
    private readonly epsilonEstimator: DbscanEpsilonEstimator,
    private readonly dbScanner: DbScanner,
    private readonly pdfWriter: WritePdf,
  ) {}

  public async run(): Promise<void> {
    const pdfPath = path.resolve(
      process.argv[2] ??
        "C:\\Users\\danha\\source\\repos\\HTML\\MonoRepro\\packages\\core-pdf-reader\\tests\\PID\\PID.pdf",
    );

    const minSamples = this.parseMinSamples(process.argv[3] ?? "4");

    await this.ensureFileExists(pdfPath);

    const fragments = await this.fragmentReader.readFragments(pdfPath);
    const estimate = this.epsilonEstimator.estimate(fragments, minSamples);

    const outputDirectory = path.resolve(".output");
    await mkdir(outputDirectory, { recursive: true });

    const epsilonOutputPath = path.join(
      outputDirectory,
      "dbscan-epsilon-estimate.json",
    );

    const clustersOutputPath = path.join(outputDirectory, "dbscan-clusters.json");

    const annotatedPdfOutputPath = path.join(
      outputDirectory,
      "PID.clusters.pdf",
    );

    await writeFile(
      epsilonOutputPath,
      JSON.stringify(
        {
          pdfPath,
          ...estimate,
        },
        null,
        2,
      ),
      "utf8",
    );

    const clusterResult = await this.dbScanner.scan(
      fragments,
      estimate.eps,
      clustersOutputPath,
      minSamples,
    );

    const annotatedPdfPath = await this.pdfWriter.writeClusters(
      clusterResult.clusters,
      annotatedPdfOutputPath,
    );

    console.log({
      pdfPath,
      fragmentCount: estimate.fragmentCount,
      pointCount: estimate.pointCount,
      minSamples: estimate.minSamples,
      k: estimate.k,
      eps: estimate.eps,
      kneeIndex: estimate.kneeIndex,
      clusterCount: clusterResult.clusters.length,
      noiseCount: clusterResult.noise.length,
      epsilonOutputPath,
      clustersOutputPath,
      annotatedPdfPath,
    });
  }

  private parseMinSamples(value: string): number {
    const parsed = Number.parseInt(value, 10);

    if (!Number.isInteger(parsed) || parsed < 2) {
      throw new Error("minSamples must be an integer >= 2.");
    }

    return parsed;
  }

  private async ensureFileExists(filePath: string): Promise<void> {
    try {
      await access(filePath);
    } catch {
      throw new Error(
        `PDF file not found: ${filePath}\n\nRun with:\n  pnpm dev -- "C:\\path\\to\\file.pdf" 4`,
      );
    }
  }
}