import {
  FragmentKinds,
  type IBoundingBox,
  type IPdfPathFragment,
  type IPdfPathSegment,
} from "@monorepo/core-pdf-domain";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

type Matrix = readonly [number, number, number, number, number, number];
type Point = Readonly<{ x: number; y: number }>;

const identity: Matrix = [1, 0, 0, 1, 0, 0];
const minVisualSize = 0.2;

export class PdfPathExtractor {
  private readonly opNameByCode = this.buildOpNameByCode();

  public async readPathFragments(
    binary: Uint8Array,
  ): Promise<readonly IPdfPathFragment[]> {
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
    const fragments: IPdfPathFragment[] = [];

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const operatorList = await page.getOperatorList();
      const viewport = page.getViewport({ scale: 1 });
      const viewportMatrix = this.asMatrix(viewport.transform);

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
          current = this.multiply(current, [
            this.toFinite(args[0]),
            this.toFinite(args[1]),
            this.toFinite(args[2]),
            this.toFinite(args[3]),
            this.toFinite(args[4]),
            this.toFinite(args[5]),
          ]);
          continue;
        }

        if (fn !== pdfjs.OPS.constructPath || !Array.isArray(args) || args.length < 3) {
          continue;
        }

        const pathOps = this.asNumberSequence(args[0]);
        const pathArgs = this.asNumberSequence(args[1]);
        const localBounds = args[2];

        if (pathOps === null || pathArgs === null) {
          continue;
        }

        const finalMatrix = this.multiply(viewportMatrix, current);
        const segments = this.buildSegments(pathOps, pathArgs, finalMatrix);

        let fragmentBounds: IBoundingBox | null = null;

        if (localBounds instanceof Float32Array && localBounds.length >= 4) {
          const mapped = this.mapBounds(
            this.toFinite(localBounds[0]),
            this.toFinite(localBounds[1]),
            this.toFinite(localBounds[2]),
            this.toFinite(localBounds[3]),
            finalMatrix,
          );

          fragmentBounds = this.normalizeBoundingBox({
            position: {
              x: mapped.minX,
              y: mapped.minY,
            },
            width: mapped.maxX - mapped.minX,
            height: mapped.maxY - mapped.minY,
          });
        }

        if (fragmentBounds === null && segments.length > 0) {
          fragmentBounds = this.unionSegments(segments);
        }

        if (fragmentBounds === null) {
          continue;
        }

        fragments.push({
          kind: FragmentKinds.Path,
          pageNumber,
          boundingBox: fragmentBounds,
          segments: Object.freeze(segments),
        });
      }
    }

    return Object.freeze(fragments);
  }

  private buildSegments(
    pathOps: ArrayLike<number>,
    pathArgs: ArrayLike<number>,
    matrix: Matrix,
  ): IPdfPathSegment[] {
    const segments: IPdfPathSegment[] = [];
    let cursor: Point = { x: 0, y: 0 };
    let subpathStart: Point | null = null;
    let argIndex = 0;

    for (let index = 0; index < pathOps.length; index += 1) {
      const opCode = pathOps[index]!;
      const opName = this.opNameByCode.get(opCode) ?? `op_${opCode}`;

      if (opCode === pdfjs.OPS.moveTo) {
        const next = this.readPoint(pathArgs, argIndex);
        argIndex += 2;
        if (next === null) {
          continue;
        }

        cursor = next;
        subpathStart = next;
        continue;
      }

      if (opCode === pdfjs.OPS.lineTo) {
        const next = this.readPoint(pathArgs, argIndex);
        argIndex += 2;
        if (next === null) {
          continue;
        }

        const box = this.normalizeBoundingBox(
          this.boxFromPoints([cursor, next], matrix),
        );
        if (box !== null) {
          segments.push({ index: segments.length, operator: opName, boundingBox: box });
        }
        cursor = next;
        continue;
      }

      if (opCode === pdfjs.OPS.curveTo) {
        const c1 = this.readPoint(pathArgs, argIndex);
        const c2 = this.readPoint(pathArgs, argIndex + 2);
        const end = this.readPoint(pathArgs, argIndex + 4);
        argIndex += 6;
        if (c1 === null || c2 === null || end === null) {
          continue;
        }

        const box = this.normalizeBoundingBox(
          this.boxFromPoints([cursor, c1, c2, end], matrix),
        );
        if (box !== null) {
          segments.push({ index: segments.length, operator: opName, boundingBox: box });
        }
        cursor = end;
        continue;
      }

      if (opCode === pdfjs.OPS.curveTo2) {
        const c2 = this.readPoint(pathArgs, argIndex);
        const end = this.readPoint(pathArgs, argIndex + 2);
        argIndex += 4;
        if (c2 === null || end === null) {
          continue;
        }

        const box = this.normalizeBoundingBox(
          this.boxFromPoints([cursor, cursor, c2, end], matrix),
        );
        if (box !== null) {
          segments.push({ index: segments.length, operator: opName, boundingBox: box });
        }
        cursor = end;
        continue;
      }

      if (opCode === pdfjs.OPS.curveTo3) {
        const c1 = this.readPoint(pathArgs, argIndex);
        const end = this.readPoint(pathArgs, argIndex + 2);
        argIndex += 4;
        if (c1 === null || end === null) {
          continue;
        }

        const box = this.normalizeBoundingBox(
          this.boxFromPoints([cursor, c1, end, end], matrix),
        );
        if (box !== null) {
          segments.push({ index: segments.length, operator: opName, boundingBox: box });
        }
        cursor = end;
        continue;
      }

      if (opCode === pdfjs.OPS.rectangle) {
        const x = this.toFinite(pathArgs[argIndex]);
        const y = this.toFinite(pathArgs[argIndex + 1]);
        const w = this.toFinite(pathArgs[argIndex + 2]);
        const h = this.toFinite(pathArgs[argIndex + 3]);
        argIndex += 4;

        const box = this.normalizeBoundingBox(
          this.mapBoxFromRect(x, y, x + w, y + h, matrix),
        );
        if (box !== null) {
          segments.push({ index: segments.length, operator: opName, boundingBox: box });
        }
        cursor = { x: x + w, y: y + h };
        continue;
      }

      if (opCode === pdfjs.OPS.closePath) {
        if (subpathStart !== null) {
          const box = this.normalizeBoundingBox(
            this.boxFromPoints([cursor, subpathStart], matrix),
          );
          if (box !== null) {
            segments.push({ index: segments.length, operator: opName, boundingBox: box });
          }
          cursor = subpathStart;
        }
        continue;
      }
    }

    return segments;
  }

  private unionSegments(segments: readonly IPdfPathSegment[]): IBoundingBox | null {
    if (segments.length === 0) {
      return null;
    }

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (const segment of segments) {
      const box = segment.boundingBox;
      minX = Math.min(minX, box.position.x);
      minY = Math.min(minY, box.position.y);
      maxX = Math.max(maxX, box.position.x + box.width);
      maxY = Math.max(maxY, box.position.y + box.height);
    }

    return this.normalizeBoundingBox({
      position: { x: minX, y: minY },
      width: maxX - minX,
      height: maxY - minY,
    });
  }

  private mapBoxFromRect(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    matrix: Matrix,
  ): IBoundingBox {
    const mapped = this.mapBounds(minX, minY, maxX, maxY, matrix);

    return {
      position: {
        x: mapped.minX,
        y: mapped.minY,
      },
      width: mapped.maxX - mapped.minX,
      height: mapped.maxY - mapped.minY,
    };
  }

  private boxFromPoints(points: readonly Point[], matrix: Matrix): IBoundingBox | null {
    if (points.length === 0) {
      return null;
    }

    const transformed = points.map((point) =>
      this.transformPoint(point.x, point.y, matrix),
    );

    const minX = Math.min(...transformed.map((point) => point.x));
    const minY = Math.min(...transformed.map((point) => point.y));
    const maxX = Math.max(...transformed.map((point) => point.x));
    const maxY = Math.max(...transformed.map((point) => point.y));

    return {
      position: {
        x: minX,
        y: minY,
      },
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  private normalizeBoundingBox(box: IBoundingBox | null): IBoundingBox | null {
    if (box === null) {
      return null;
    }

    const x = this.toFinite(box.position.x);
    const y = this.toFinite(box.position.y);
    const width = Math.abs(this.toFinite(box.width));
    const height = Math.abs(this.toFinite(box.height));

    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return null;
    }

    if (width === 0 && height === 0) {
      return null;
    }

    const normalizedWidth = width > 0 ? width : minVisualSize;
    const normalizedHeight = height > 0 ? height : minVisualSize;

    return {
      position: {
        x: width > 0 ? x : x - minVisualSize / 2,
        y: height > 0 ? y : y - minVisualSize / 2,
      },
      width: normalizedWidth,
      height: normalizedHeight,
    };
  }

  private readPoint(values: ArrayLike<number>, index: number): Point | null {
    if (index + 1 >= values.length) {
      return null;
    }

    return {
      x: this.toFinite(values[index]),
      y: this.toFinite(values[index + 1]),
    };
  }

  private buildOpNameByCode(): ReadonlyMap<number, string> {
    const mapping = new Map<number, string>();

    for (const [name, value] of Object.entries(pdfjs.OPS)) {
      if (typeof value === "number") {
        mapping.set(value, name);
      }
    }

    return mapping;
  }

  private asNumberSequence(value: unknown): ArrayLike<number> | null {
    if (Array.isArray(value)) {
      return value as number[];
    }

    if (
      value instanceof Float32Array
      || value instanceof Float64Array
      || value instanceof Int8Array
      || value instanceof Uint8Array
      || value instanceof Uint8ClampedArray
      || value instanceof Int16Array
      || value instanceof Uint16Array
      || value instanceof Int32Array
      || value instanceof Uint32Array
    ) {
      return value;
    }

    return null;
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

  private transformPoint(x: number, y: number, matrix: Matrix): Point {
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
