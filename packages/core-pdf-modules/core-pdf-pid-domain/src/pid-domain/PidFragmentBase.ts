import type { IBoundingBox, PdfFragment } from "@monorepo/core-pdf-domain";
import type { IPidFragment } from "./IPidFragment.js";
import type { PidFragmentKind } from "./PidFragmentKind.js";

export abstract class PidFragmentBase<TKind extends PidFragmentKind>
  implements IPidFragment<TKind> {
  public readonly pidKind: TKind;
  public readonly pageNumber: number;
  public readonly boundingBox: IBoundingBox;
  public readonly sourceFragments: readonly PdfFragment[];

  protected constructor(params: {
    readonly pidKind: TKind;
    readonly pageNumber: number;
    readonly boundingBox: IBoundingBox;
    readonly sourceFragments: readonly PdfFragment[];
  }) {
    this.ensurePageNumber(params.pageNumber);
    this.ensureBoundingBox(params.boundingBox);
    this.ensureSourceFragments(params.sourceFragments);

    this.pidKind = params.pidKind;
    this.pageNumber = params.pageNumber;
    this.boundingBox = params.boundingBox;
    this.sourceFragments = Object.freeze([...params.sourceFragments]);
  }

  private ensurePageNumber(value: number): void {
    if (!Number.isInteger(value) || value < 1) {
      throw new Error("pageNumber must be an integer >= 1.");
    }
  }

  private ensureBoundingBox(value: IBoundingBox): void {
    if (
      !Number.isFinite(value.position.x) ||
      !Number.isFinite(value.position.y) ||
      !Number.isFinite(value.width) ||
      !Number.isFinite(value.height)
    ) {
      throw new Error("boundingBox must contain finite numbers.");
    }

    if (value.width <= 0) {
      throw new Error("boundingBox.width must be greater than zero.");
    }

    if (value.height <= 0) {
      throw new Error("boundingBox.height must be greater than zero.");
    }
  }

  private ensureSourceFragments(value: readonly PdfFragment[]): void {
    if (value.length === 0) {
      throw new Error("sourceFragments must contain at least one fragment.");
    }
  }
}