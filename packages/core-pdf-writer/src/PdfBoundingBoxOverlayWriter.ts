import { readFile, writeFile } from "node:fs/promises";

import { PDFDocument, rgb } from "pdf-lib";

import type {
  IPdfRectangleFragment,
  IPdfRectangleOverlayWriteRequest,
} from "./IPdfRectangleFragment.js";

export class PdfBoundingBoxOverlayWriter {
  public async write(request: IPdfRectangleOverlayWriteRequest): Promise<void> {
    const sourceBytes = await readFile(request.sourcePdfPath);
    const document = await PDFDocument.load(sourceBytes);
    const pages = document.getPages();

    for (const rectangle of request.rectangles) {
      this.drawRectangle(pages, rectangle);
    }

    const outputBytes = await document.save();
    await writeFile(request.outputPdfPath, outputBytes);
  }

  private drawRectangle(
    pages: ReturnType<PDFDocument["getPages"]>,
    rectangle: IPdfRectangleFragment,
  ): void {
    const page = pages[rectangle.pageNumber - 1];
    if (page === undefined) {
      return;
    }

    page.drawRectangle({
      x: rectangle.x,
      y: rectangle.y,
      width: Math.max(rectangle.width, 0.5),
      height: Math.max(rectangle.height, 0.5),
      borderColor: rgb(1, 0, 0),
      borderWidth: 0.6,
      opacity: 0.15,
    });
  }
}
