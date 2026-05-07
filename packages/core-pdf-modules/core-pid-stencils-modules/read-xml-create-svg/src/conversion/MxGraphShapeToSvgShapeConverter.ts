import type {
  MxGraphDrawable,
  MxGraphEllipse,
  MxGraphPath,
  MxGraphShape
} from "../domain/MxGraphShape.js";
import type {
  SvgElement,
  SvgElementStyle,
  SvgShape
} from "../domain/SvgShape.js";
import type { ISvgShapeConverter } from "../ports/ISvgShapeConverter.js";
import { SvgPathDataConverter } from "./SvgPathDataConverter.js";

interface ConversionState {
  readonly pending: readonly (MxGraphPath | MxGraphEllipse)[];
  readonly elements: readonly SvgElement[];
  readonly strokeLineJoin: string | undefined;
}

export class MxGraphShapeToSvgShapeConverter implements ISvgShapeConverter {
  public constructor(private readonly pathConverter: SvgPathDataConverter) {}

  public convert(shape: MxGraphShape, rootName = ""): SvgShape {
    return {
      rootName,
      name: shape.name,
      width: shape.width,
      height: shape.height,
      aspect: shape.aspect,
      strokeWidth: shape.strokeWidth,
      connections: shape.connections,
      background: this.convertLayer(shape.background, shape.strokeWidth),
      foreground: this.convertLayer(shape.foreground, shape.strokeWidth)
    };
  }

  private convertLayer(
    drawables: readonly MxGraphDrawable[],
    strokeWidth: string
  ): readonly SvgElement[] {
    const initialState: ConversionState = {
      pending: [],
      elements: [],
      strokeLineJoin: undefined
    };

    const converted = drawables.reduce(
      (state, drawable) => this.applyDrawable(state, drawable, strokeWidth),
      initialState
    );

    return this.flushPendingAsStroke(converted, strokeWidth).elements;
  }

  private applyDrawable(
    state: ConversionState,
    drawable: MxGraphDrawable,
    strokeWidth: string
  ): ConversionState {
    switch (drawable.kind) {
      case "path":
      case "ellipse":
        return {
          ...state,
          pending: [...state.pending, drawable]
        };

      case "stroke":
        return this.flushPending(state, {
          fill: "none",
          stroke: "currentColor",
          strokeWidth,
          strokeLineJoin: state.strokeLineJoin
        });

      case "fillstroke":
        return this.flushPending(state, {
          fill: "currentColor",
          stroke: "currentColor",
          strokeWidth,
          strokeLineJoin: state.strokeLineJoin
        });

      case "linejoin":
        return {
          ...state,
          strokeLineJoin: drawable.join
        };
    }
  }

  private flushPendingAsStroke(
    state: ConversionState,
    strokeWidth: string
  ): ConversionState {
    if (state.pending.length === 0) {
      return state;
    }

    return this.flushPending(state, {
      fill: "none",
      stroke: "currentColor",
      strokeWidth,
      strokeLineJoin: state.strokeLineJoin
    });
  }

  private flushPending(
    state: ConversionState,
    style: SvgElementStyle
  ): ConversionState {
    return {
      ...state,
      pending: [],
      elements: [
        ...state.elements,
        ...state.pending.map((geometry) => this.convertGeometry(geometry, style))
      ]
    };
  }

  private convertGeometry(
    geometry: MxGraphPath | MxGraphEllipse,
    style: SvgElementStyle
  ): SvgElement {
    switch (geometry.kind) {
      case "path":
        return {
          kind: "path",
          d: this.pathConverter.convert(geometry.commands),
          ...style
        };

      case "ellipse":
        return {
          kind: "ellipse",
          cx: geometry.x + geometry.width / 2,
          cy: geometry.y + geometry.height / 2,
          rx: geometry.width / 2,
          ry: geometry.height / 2,
          ...style
        };
    }
  }
}