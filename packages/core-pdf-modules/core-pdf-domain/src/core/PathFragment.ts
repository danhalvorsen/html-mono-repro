import type { IBoundingBox } from "./IBoundingBox.js";
import type { Rectangle } from "./Rectangle.js";
import { GeometryFragment } from "./GeometryFragment.js";
import {
  FragmentKinds,
  type PdfFragmentKind,
} from "../pdf-domain/fragments/PdfFragmentKind.js";
import type { IPdfPathFragment } from "../pdf-domain/fragments/IPdfPathFragment.js";
import type { IPdfPathSegment } from "../pdf-domain/fragments/IPdfPathSegment.js";

export class PathFragment extends GeometryFragment<PathFragment> {
  private indexValue!: number;
  private pageNumberValue!: number;
  private rectangleValue!: Rectangle;
  private segmentsValue!: readonly IPdfPathSegment[];

  public constructor(params: {
    index: number;
    pageNumber: number;
    rectangle: Rectangle;
    segments: readonly IPdfPathSegment[];
  }) {
    super();
    this.initializeFragment({
      index: params.index,
      pageNumber: params.pageNumber,
      rectangle: params.rectangle,
    });
    this.segments = params.segments;
  }

  public static fromSource(
    source: IPdfPathFragment,
    index: number,
    rectangle: Rectangle,
  ): PathFragment {
    return new PathFragment({
      index,
      pageNumber: source.pageNumber,
      rectangle,
      segments: source.segments,
    });
  }

  public override get index(): number {
    return this.indexValue;
  }

  protected override set index(value: number) {
    this.indexValue = value;
  }

  public override get pageNumber(): number {
    return this.pageNumberValue;
  }

  protected override set pageNumber(value: number) {
    this.pageNumberValue = value;
  }

  public override get rectangle(): Rectangle {
    return this.rectangleValue;
  }

  protected override set rectangle(value: Rectangle) {
    this.rectangleValue = value;
  }

  public get segments(): readonly IPdfPathSegment[] {
    return this.segmentsValue;
  }

  private set segments(value: readonly IPdfPathSegment[]) {
    this.segmentsValue = Object.freeze(
      value.map((segment) => Object.freeze({
        index: segment.index,
        operator: segment.operator,
        boundingBox: this.cloneBoundingBox(segment.boundingBox),
      })),
    );
  }

  public override get kind(): PdfFragmentKind {
    return FragmentKinds.Path;
  }

  public toSource(): IPdfPathFragment {
    return Object.freeze({
      kind: FragmentKinds.Path,
      pageNumber: this.pageNumber,
      boundingBox: this.rectangle.toBoundingBox(),
      segments: this.segments,
    });
  }

  protected override withRectangle(rectangle: Rectangle): PathFragment {
    return new PathFragment({
      index: this.index,
      pageNumber: this.pageNumber,
      rectangle,
      segments: this.segments,
    });
  }

  private cloneBoundingBox(source: IBoundingBox): IBoundingBox {
    return Object.freeze({
      position: Object.freeze({
        x: source.position.x,
        y: source.position.y,
      }),
      width: source.width,
      height: source.height,
    });
  }
}
