// src/WritePdf.ts

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { PDFDocument, rgb } from "pdf-lib";

import type { PdfFragment } from "@monorepo/core-pdf-domain";

export type PdfFragmentCluster = {
  readonly id: string;
  readonly items: readonly PdfFragment[];
};

type BoundingBox = {
  readonly pageNumber: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

export class WritePdf {
  public constructor(private readonly sourcePdfPath: string) {}

  public async writeClusters(
    clusters: readonly PdfFragmentCluster[],
    outputPdfPath: string,
  ): Promise<string> {
    const sourcePdf = await readFile(this.sourcePdfPath);
    const document = await PDFDocument.load(sourcePdf);

    for (const box of this.createClusterBoxes(clusters)) {
      const page = document.getPage(box.pageNumber - 1);

      page.drawRectangle({
        x: box.x,
        y: page.getHeight() - box.y - box.height,
        width: box.width,
        height: box.height,
        borderWidth: 4,
        borderColor: rgb(0, 0.2, 1),
        borderDashArray: [12, 6],
      });
    }

    const outputPdf = await document.save();

    await mkdir(dirname(outputPdfPath), { recursive: true });
    await writeFile(outputPdfPath, outputPdf);

    return outputPdfPath;
  }

  private createClusterBoxes(
    clusters: readonly PdfFragmentCluster[],
  ): readonly BoundingBox[] {
    return clusters.flatMap((cluster) => this.createClusterBoxesByPage(cluster));
  }

  private createClusterBoxesByPage(
    cluster: PdfFragmentCluster,
  ): readonly BoundingBox[] {
    const pageNumbers = [...new Set(cluster.items.map((item) => item.pageNumber))];

    return pageNumbers.map((pageNumber) =>
      this.createBoundingBox(
        pageNumber,
        cluster.items.filter((item) => item.pageNumber === pageNumber),
      ),
    );
  }

  private createBoundingBox(
    pageNumber: number,
    fragments: readonly PdfFragment[],
  ): BoundingBox {
    if (fragments.length === 0) {
      throw new Error("Cannot create cluster box from empty fragment list.");
    }

    const left = Math.min(
      ...fragments.map((fragment) => fragment.boundingBox.position.x),
    );

    const top = Math.min(
      ...fragments.map((fragment) => fragment.boundingBox.position.y),
    );

    const right = Math.max(
      ...fragments.map(
        (fragment) =>
          fragment.boundingBox.position.x + fragment.boundingBox.width,
      ),
    );

    const bottom = Math.max(
      ...fragments.map(
        (fragment) =>
          fragment.boundingBox.position.y + fragment.boundingBox.height,
      ),
    );

    return {
      pageNumber,
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
    };
  }
}