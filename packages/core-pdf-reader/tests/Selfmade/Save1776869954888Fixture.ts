import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { PDFDocument, StandardFonts } from "pdf-lib";
import type { IPdfRectangleFragment, IPdfTextFragment, IPdfPageText } from "@monorepo/core-pdf-domain";

import { CompositePdfEngine } from "../../src/engine/CompositePdfEngine.js";

type Matrix = readonly [number, number, number, number, number, number];

const identity: Matrix = [1, 0, 0, 1, 0, 0];

export class Save1776869954888Fixture {
  private readonly pdfPath: string;
  private currentBinary: Uint8Array | null = null;

  public constructor() {
    const thisDirectory = dirname(fileURLToPath(import.meta.url));
    this.pdfPath = join(thisDirectory, "save-1776869954888.pdf");
  }

  public async setText(content: string): Promise<void> {
    const normalizedContent = content.trim();
    if (normalizedContent.length === 0) {
      throw new Error("content must not be empty.");
    }

    const document = await PDFDocument.create();
    const page = document.addPage([595, 842]);
    const font = await document.embedFont(StandardFonts.Helvetica);

    page.drawText(normalizedContent, {
      x: 72,
      y: 742,
      size: 18,
      font,
    });

    this.currentBinary = await document.save();
  }

  public async setBoxesOnly(count = 10): Promise<void> {
    if (!Number.isInteger(count) || count <= 0) {
      throw new Error("count must be a positive integer.");
    }

    const document = await PDFDocument.create();
    const page = document.addPage([595, 842]);
    const boxes = this.buildBoxLayout(count);

    for (const box of boxes) {
      page.drawRectangle({
        x: box.x,
        y: box.y,
        width: box.size,
        height: box.size,
        borderWidth: 1.2,
      });
    }

    this.currentBinary = await document.save();
  }

  public async setBoxesWithText(contents: readonly string[]): Promise<void> {
    if (!Array.isArray(contents) || contents.length === 0) {
      throw new Error("contents must be a non-empty array.");
    }

    const normalized = contents.map((item) => item.trim());
    if (normalized.some((item) => item.length === 0)) {
      throw new Error("contents must contain non-empty strings.");
    }

    const document = await PDFDocument.create();
    const page = document.addPage([595, 842]);
    const font = await document.embedFont(StandardFonts.Helvetica);
    const boxes = this.buildBoxLayout(normalized.length);

    for (let i = 0; i < boxes.length; i += 1) {
      const box = boxes[i]!;
      const content = normalized[i]!;

      page.drawRectangle({
        x: box.x,
        y: box.y,
        width: box.size,
        height: box.size,
        borderWidth: 1.2,
      });

      page.drawText(content, {
        x: box.x + 8,
        y: box.y + box.size / 2 - 6,
        size: 12,
        font,
      });
    }

    this.currentBinary = await document.save();
  }

  public clearText(): void {
    this.currentBinary = null;
  }

  public async readPageCount(): Promise<number> {
    const engine = new CompositePdfEngine();
    return engine.readPageCount(await this.readBinary());
  }

  public async readTextFragments(): Promise<readonly IPdfTextFragment[]> {
    const engine = new CompositePdfEngine();
    return engine.readTextFragments(await this.readBinary());
  }

  public async readPages(): Promise<readonly IPdfPageText[]> {
    const engine = new CompositePdfEngine();
    return engine.readPages(await this.readBinary());
  }

  public async readRectangleFragments(): Promise<readonly IPdfRectangleFragment[]> {
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(await this.readBinary()),
      disableWorker: true,
      useWorkerFetch: false,
      isEvalSupported: false,
      isOffscreenCanvasSupported: false,
      isImageDecoderSupported: false,
      useSystemFonts: false,
    } as unknown as Parameters<typeof pdfjs.getDocument>[0]);

    const document = await loadingTask.promise;
    const fragments: IPdfRectangleFragment[] = [];

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const operatorList = await page.getOperatorList();

      let current: Matrix = identity;
      const stack: Matrix[] = [];

      for (let i = 0; i < operatorList.fnArray.length; i += 1) {
        const fn = operatorList.fnArray[i];
        const args = operatorList.argsArray[i];

        if (fn === pdfjs.OPS.save) {
          stack.push(current);
          continue;
        }

        if (fn === pdfjs.OPS.restore) {
          current = stack.pop() ?? identity;
          continue;
        }

        if (fn === pdfjs.OPS.transform && Array.isArray(args) && args.length >= 6) {
          current = this.multiply(
            current,
            [
              this.toFinite(args[0]),
              this.toFinite(args[1]),
              this.toFinite(args[2]),
              this.toFinite(args[3]),
              this.toFinite(args[4]),
              this.toFinite(args[5]),
            ],
          );
          continue;
        }

        if (fn !== pdfjs.OPS.constructPath || !Array.isArray(args) || args.length < 3) {
          continue;
        }

        // args[2] = local bounds [minX, minY, maxX, maxY] for this path.
        const localBounds = args[2];
        if (!(localBounds instanceof Float32Array) || localBounds.length < 4) {
          continue;
        }

        const mapped = this.mapBounds(
          this.toFinite(localBounds[0]),
          this.toFinite(localBounds[1]),
          this.toFinite(localBounds[2]),
          this.toFinite(localBounds[3]),
          current,
        );

        fragments.push({
          kind: "rectangle",
          pageNumber,
          boundingBox: {
            position: {
              x: mapped.minX,
              y: mapped.minY,
            },
            width: mapped.maxX - mapped.minX,
            height: mapped.maxY - mapped.minY,
          },
        });
      }
    }

    return Object.freeze(
      fragments.filter((fragment) =>
        fragment.boundingBox.width > 0 && fragment.boundingBox.height > 0,
      ),
    );
  }

  private async readBinary(): Promise<Uint8Array> {
    if (this.currentBinary !== null) {
      return this.currentBinary;
    }

    return new Uint8Array(await readFile(this.pdfPath));
  }

  private multiply(left: Matrix, right: Matrix): Matrix {
    const [a0, a1, a2, a3, a4, a5] = left;
    const [b0, b1, b2, b3, b4, b5] = right;

    return [
      a0 * b0 + a2 * b1,
      a1 * b0 + a3 * b1,
      a0 * b2 + a2 * b3,
      a1 * b2 + a3 * b3,
      a0 * b4 + a2 * b5 + a4,
      a1 * b4 + a3 * b5 + a5,
    ];
  }

  private transformPoint(x: number, y: number, matrix: Matrix): { x: number; y: number } {
    const [a, b, c, d, e, f] = matrix;
    return {
      x: a * x + c * y + e,
      y: b * x + d * y + f,
    };
  }

  private mapBounds(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    matrix: Matrix,
  ): {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  } {
    const corners = [
      this.transformPoint(minX, minY, matrix),
      this.transformPoint(maxX, minY, matrix),
      this.transformPoint(maxX, maxY, matrix),
      this.transformPoint(minX, maxY, matrix),
    ];

    return {
      minX: Math.min(...corners.map((corner) => corner.x)),
      minY: Math.min(...corners.map((corner) => corner.y)),
      maxX: Math.max(...corners.map((corner) => corner.x)),
      maxY: Math.max(...corners.map((corner) => corner.y)),
    };
  }

  private toFinite(value: unknown): number {
    return Number.isFinite(value) ? (value as number) : 0;
  }

  private buildBoxLayout(count: number): readonly { x: number; y: number; size: number }[] {
    const size = 72;
    const gap = 32;
    const columns = 5;
    const originX = 72;
    const originY = 680;
    const boxes: { x: number; y: number; size: number }[] = [];

    for (let i = 0; i < count; i += 1) {
      const column = i % columns;
      const row = Math.floor(i / columns);
      boxes.push({
        x: originX + column * (size + gap),
        y: originY - row * (size + gap),
        size,
      });
    }

    return Object.freeze(boxes);
  }
}
