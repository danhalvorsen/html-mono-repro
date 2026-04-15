import * as Pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

import type { IPdfJsTextItemLike } from "./IPdfJsTextItemLike.js";
import type { IPdfJsViewportLike } from "./IPdfJsViewportLike.js";
import type { IPdfTextBoundingBoxIdentifier } from "./IPdfTextBoundingBoxIdentifier.js";
import { PdfBoundingBox } from "./PdfBoundingBox.js";
import { PdfPoint } from "./PdfPoint.js";
import { PdfTextItemBoundingBox } from "./PdfTextItemBoundingBox.js";
import { PdfTextItemQuad } from "./PdfTextItemQuad.js";

export class PdfJsTextBoundingBoxIdentifier
  implements IPdfTextBoundingBoxIdentifier
{
  public identify(
    item: IPdfJsTextItemLike,
    viewport: IPdfJsViewportLike,
  ): PdfTextItemBoundingBox {
    const transformed = Pdfjs.Util.transform(
      viewport.transform,
      item.transform,
    ) as readonly number[];

    const originX = this.toNumber(transformed[4]);
    const originY = this.toNumber(transformed[5]);
    const height = this.resolveHeight(item, transformed);
    const width = this.toNumber(item.width);
    const angleRadians = Math.atan2(
      this.toNumber(transformed[2]),
      this.toNumber(transformed[0]),
    );

    const horizontalBoundingBox: readonly number[] = [
      originX,
      originY - height,
      originX + width,
      originY - height,
      originX + width,
      originY,
      originX,
      originY,
    ];

    const rotated = this.rotateBoundingBox(
      horizontalBoundingBox,
      [originX, originY],
      angleRadians,
    );

    return new PdfTextItemBoundingBox(
      item.str,
      angleRadians,
      this.createQuad(rotated),
      this.createBounds(rotated),
    );
  }

  public identifyMany(
    items: readonly IPdfJsTextItemLike[],
    viewport: IPdfJsViewportLike,
  ): readonly PdfTextItemBoundingBox[] {
    return Object.freeze(
      items.map((item) => this.identify(item, viewport)),
    );
  }

  private resolveHeight(
    item: IPdfJsTextItemLike,
    transformed: readonly number[],
  ): number {
    const explicitHeight = this.toNumber(item.height);
    if (explicitHeight > 0) {
      return explicitHeight;
    }

    return Math.sqrt(
      this.toNumber(transformed[2]) * this.toNumber(transformed[2]) +
        this.toNumber(transformed[3]) * this.toNumber(transformed[3]),
    );
  }

  private rotateBoundingBox(
    absoluteBoundingBox: readonly number[],
    origin: readonly [number, number],
    radians: number,
  ): readonly number[] {
    const [originX, originY] = origin;
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);

    const rotate = (x: number, y: number): readonly [number, number] => [
      (x - originX) * cosine - (y - originY) * sine + originX,
      (x - originX) * sine + (y - originY) * cosine + originY,
    ];

    const [
      firstX,
      firstY,
      secondX,
      secondY,
      thirdX,
      thirdY,
      fourthX,
      fourthY,
    ] = absoluteBoundingBox;

    return Object.freeze([
      ...rotate(this.toNumber(firstX), this.toNumber(firstY)),
      ...rotate(this.toNumber(secondX), this.toNumber(secondY)),
      ...rotate(this.toNumber(thirdX), this.toNumber(thirdY)),
      ...rotate(this.toNumber(fourthX), this.toNumber(fourthY)),
    ]);
  }

  private createQuad(rotated: readonly number[]): PdfTextItemQuad {
    return new PdfTextItemQuad(
      new PdfPoint(this.toNumber(rotated[0]), this.toNumber(rotated[1])),
      new PdfPoint(this.toNumber(rotated[2]), this.toNumber(rotated[3])),
      new PdfPoint(this.toNumber(rotated[4]), this.toNumber(rotated[5])),
      new PdfPoint(this.toNumber(rotated[6]), this.toNumber(rotated[7])),
    );
  }

  private createBounds(rotated: readonly number[]): PdfBoundingBox {
    const xs = [rotated[0], rotated[2], rotated[4], rotated[6]].map((value) =>
      this.toNumber(value),
    );
    const ys = [rotated[1], rotated[3], rotated[5], rotated[7]].map((value) =>
      this.toNumber(value),
    );

    const left = Math.min(...xs);
    const right = Math.max(...xs);
    const top = Math.min(...ys);
    const bottom = Math.max(...ys);

    return new PdfBoundingBox(
      new PdfPoint(left, top),
      right - left,
      bottom - top,
    );
  }

  private toNumber(value: unknown): number {
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
  }
}
