import type {
  IPdfRectangleFragment,
  IPdfTextFragment,
} from "@monorepo/core-pdf-domain";
import { FragmentKinds } from "@monorepo/core-pdf-domain";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

type Matrix = readonly [number, number, number, number, number, number];

const identity: Matrix = [1, 0, 0, 1, 0, 0];

export class PdfRectangleExtractor {
  public async readRectangleFragments(
    binary: Uint8Array,
    textFragments: readonly Pick<IPdfTextFragment, "pageNumber" | "boundingBox">[] = [],
  ): Promise<readonly IPdfRectangleFragment[]> {
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(binary),
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
      const viewport = page.getViewport({ scale: 1 });

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

        const localBounds = args[2];
        if (!(localBounds instanceof Float32Array) || localBounds.length < 4) {
          continue;
        }

        const viewportMatrix = this.asMatrix(viewport.transform);
        const finalMatrix = this.multiply(viewportMatrix, current);
        const mapped = this.mapBounds(
          this.toFinite(localBounds[0]),
          this.toFinite(localBounds[1]),
          this.toFinite(localBounds[2]),
          this.toFinite(localBounds[3]),
          finalMatrix,
        );

        const width = mapped.maxX - mapped.minX;
        const height = mapped.maxY - mapped.minY;
        if (width <= 0 || height <= 0) {
          continue;
        }

        fragments.push({
          kind: FragmentKinds.Rectangle,
          pageNumber,
          boundingBox: {
            position: {
              x: mapped.minX,
              y: mapped.minY,
            },
            width,
            height,
          },
        });
      }
    }

    return Object.freeze(this.filterOverlaidTextRectangles(fragments, textFragments));
  }

  private filterOverlaidTextRectangles(
    rectangles: readonly IPdfRectangleFragment[],
    textFragments: readonly Pick<IPdfTextFragment, "pageNumber" | "boundingBox">[],
  ): readonly IPdfRectangleFragment[] {
    if (textFragments.length === 0) {
      return rectangles;
    }

    return rectangles.filter((rectangle) =>
      !textFragments.some((text) =>
        text.pageNumber === rectangle.pageNumber
        && this.contains(
          rectangle,
          text.boundingBox.position.x,
          text.boundingBox.position.y,
        ),
      ),
    );
  }

  private contains(
    rectangle: IPdfRectangleFragment,
    x: number,
    y: number,
  ): boolean {
    const left = rectangle.boundingBox.position.x;
    const top = rectangle.boundingBox.position.y;
    const right = left + rectangle.boundingBox.width;
    const bottom = top + rectangle.boundingBox.height;

    return x >= left && x <= right && y >= top && y <= bottom;
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

  private asMatrix(value: readonly number[]): Matrix {
    return [
      this.toFinite(value[0]),
      this.toFinite(value[1]),
      this.toFinite(value[2]),
      this.toFinite(value[3]),
      this.toFinite(value[4]),
      this.toFinite(value[5]),
    ];
  }

  private toFinite(value: unknown): number {
    return Number.isFinite(value) ? (value as number) : 0;
  }
}
