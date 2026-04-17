// packages/core-pdf-domain/src/models/PdfRectangleFragment.ts

import { IBoundingBox } from "../core/IBoundingBox.js";
import { IPdfRectangleFragment } from "./IPdfRectangleFragment.js";

export type PdfRectangleFragmentProps = {
  readonly pageNumber: number;
  readonly boundingBox: IBoundingBox;
};

export class PdfRectangleFragment {
  public readonly kind = "rectangle";

  private readonly pageNumberValue: number;
  private readonly boundingBoxValue: IBoundingBox;

  public constructor(props: PdfRectangleFragmentProps) {
    this.ensurePageNumber(props.pageNumber);
    this.ensureBoundingBox(props.boundingBox);

    this.pageNumberValue = props.pageNumber;
    this.boundingBoxValue = Object.freeze({
      ...props.boundingBox,
      position: Object.freeze({
        x: props.boundingBox.position.x,
        y: props.boundingBox.position.y,
      }),
    });
  }

  public static create(props: PdfRectangleFragmentProps): PdfRectangleFragment {
    return new PdfRectangleFragment(props);
  }

  public get pageNumber(): number {
    return this.pageNumberValue;
  }

  public get boundingBox(): IBoundingBox {
    return this.boundingBoxValue;
  }

  public toSource(): IPdfRectangleFragment {
    return Object.freeze({
      kind: this.kind,
      pageNumber: this.pageNumberValue,
      boundingBox: this.boundingBoxValue,
    });
  }

  private ensurePageNumber(pageNumber: number): void {
    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
      throw new Error("pageNumber must be an integer greater than or equal to one.");
    }
  }

  private ensureBoundingBox(boundingBox: IBoundingBox): void {
    if (boundingBox === null || boundingBox === undefined) {
      throw new Error("boundingBox is required.");
    }

    if (!Number.isFinite(boundingBox.position.x)) {
      throw new Error("boundingBox.position.x must be finite.");
    }

    if (!Number.isFinite(boundingBox.position.y)) {
      throw new Error("boundingBox.position.y must be finite.");
    }

    if (!Number.isFinite(boundingBox.width)) {
      throw new Error("boundingBox.width must be finite.");
    }

    if (!Number.isFinite(boundingBox.height)) {
      throw new Error("boundingBox.height must be finite.");
    }

    if (boundingBox.width <= 0) {
      throw new Error("boundingBox.width must be greater than zero.");
    }

    if (boundingBox.height <= 0) {
      throw new Error("boundingBox.height must be greater than zero.");
    }
  }
}