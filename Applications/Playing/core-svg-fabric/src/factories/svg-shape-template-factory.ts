import { type TemplateResult } from "lit";
import {
  assertFinite,
  assertNonNegative,
  assertPositive,
} from "../domain/number-guards.js";
import {
  createSvgNodeDefaults,
  freezeSvgNode,
  SvgNodeKind,
  type SvgCircleNode,
  type SvgGroupNode,
  type SvgNode,
  type SvgPolygonNode,
  type SvgRectNode,
  type SvgRootNode,
  type SvgStrokeFillStyle,
  type SvgTextNode,
  type SvgViewport,
} from "../domain/svg-node.js";
import { litSvgNodeRenderer } from "../renderers/lit-svg-node-renderer.js";

type TextAnchor = "start" | "middle" | "end";

function applyStrokeFillStyle<TBuilder extends {
  fill(value: string): TBuilder;
  stroke(value: string): TBuilder;
  strokeWidth(value: number): TBuilder;
  strokeDasharray(value: string): TBuilder;
  opacity(value: number): TBuilder;
}>(
  builder: TBuilder,
  style: SvgStrokeFillStyle,
): TBuilder {
  if (style.fill !== undefined) {
    builder.fill(style.fill);
  }

  if (style.stroke !== undefined) {
    builder.stroke(style.stroke);
  }

  if (style.strokeWidth !== undefined) {
    builder.strokeWidth(style.strokeWidth);
  }

  if (style.strokeDasharray !== undefined) {
    builder.strokeDasharray(style.strokeDasharray);
  }

  if (style.opacity !== undefined) {
    builder.opacity(style.opacity);
  }

  return builder;
}

function createStrokeFillStyle(
  fill: string | undefined,
  stroke: string | undefined,
  strokeWidth: number | undefined,
  strokeDasharray: string | undefined,
  opacity: number | undefined,
): SvgStrokeFillStyle | undefined {
  if (
    fill !== undefined ||
    stroke !== undefined ||
    strokeWidth !== undefined ||
    strokeDasharray !== undefined ||
    opacity !== undefined
  ) {
    return {
      ...(fill !== undefined ? { fill } : {}),
      ...(stroke !== undefined ? { stroke } : {}),
      ...(strokeWidth !== undefined ? { strokeWidth } : {}),
      ...(strokeDasharray !== undefined ? { strokeDasharray } : {}),
      ...(opacity !== undefined ? { opacity } : {}),
    };
  }

  return undefined;
}

function styleOrEmpty(style: SvgStrokeFillStyle | undefined): SvgStrokeFillStyle {
  return style ?? {};
}

export class RectBuilder {
  private xValue = 0;
  private yValue = 0;
  private widthValue = 0;
  private heightValue = 0;
  private fillValue?: string;
  private strokeValue?: string;
  private strokeWidthValue?: number;
  private strokeDasharrayValue?: string;
  private opacityValue?: number;
  private rxValue?: number;
  private ryValue?: number;

  x(value: number): this {
    assertFinite(value, "x");
    this.xValue = value;
    return this;
  }

  y(value: number): this {
    assertFinite(value, "y");
    this.yValue = value;
    return this;
  }

  width(value: number): this {
    // Builders are the boundary where invalid geometry is rejected.
    assertNonNegative(value, "width");
    this.widthValue = value;
    return this;
  }

  height(value: number): this {
    assertNonNegative(value, "height");
    this.heightValue = value;
    return this;
  }

  fill(value: string): this {
    this.fillValue = value;
    return this;
  }

  stroke(value: string): this {
    this.strokeValue = value;
    return this;
  }

  strokeWidth(value: number): this {
    assertNonNegative(value, "strokeWidth");
    this.strokeWidthValue = value;
    return this;
  }

  strokeDasharray(value: string): this {
    this.strokeDasharrayValue = value;
    return this;
  }

  opacity(value: number): this {
    assertNonNegative(value, "opacity");
    this.opacityValue = value;
    return this;
  }

  rx(value: number): this {
    assertNonNegative(value, "rx");
    this.rxValue = value;
    return this;
  }

  ry(value: number): this {
    assertNonNegative(value, "ry");
    this.ryValue = value;
    return this;
  }

  style(value: SvgStrokeFillStyle): this {
    return applyStrokeFillStyle(this, value);
  }

  buildNode(): SvgRectNode {
    const style = createStrokeFillStyle(
      this.fillValue,
      this.strokeValue,
      this.strokeWidthValue,
      this.strokeDasharrayValue,
      this.opacityValue,
    );

    return freezeSvgNode({
      kind: SvgNodeKind.Rect,
      ...createSvgNodeDefaults(),
      x: this.xValue,
      y: this.yValue,
      width: this.widthValue,
      height: this.heightValue,
      ...(this.rxValue !== undefined ? { rx: this.rxValue } : {}),
      ...(this.ryValue !== undefined ? { ry: this.ryValue } : {}),
      style: styleOrEmpty(style),
    });
  }

  build(): TemplateResult {
    return litSvgNodeRenderer.render(this.buildNode());
  }
}

export class CircleBuilder {
  private cxValue = 0;
  private cyValue = 0;
  private radiusValue = 0;
  private fillValue?: string;
  private strokeValue?: string;
  private strokeWidthValue?: number;
  private strokeDasharrayValue?: string;
  private opacityValue?: number;

  cx(value: number): this {
    assertFinite(value, "cx");
    this.cxValue = value;
    return this;
  }

  cy(value: number): this {
    assertFinite(value, "cy");
    this.cyValue = value;
    return this;
  }

  radius(value: number): this {
    assertNonNegative(value, "radius");
    this.radiusValue = value;
    return this;
  }

  fill(value: string): this {
    this.fillValue = value;
    return this;
  }

  stroke(value: string): this {
    this.strokeValue = value;
    return this;
  }

  strokeWidth(value: number): this {
    assertNonNegative(value, "strokeWidth");
    this.strokeWidthValue = value;
    return this;
  }

  strokeDasharray(value: string): this {
    this.strokeDasharrayValue = value;
    return this;
  }

  opacity(value: number): this {
    assertNonNegative(value, "opacity");
    this.opacityValue = value;
    return this;
  }

  style(value: SvgStrokeFillStyle): this {
    return applyStrokeFillStyle(this, value);
  }

  buildNode(): SvgCircleNode {
    const style = createStrokeFillStyle(
      this.fillValue,
      this.strokeValue,
      this.strokeWidthValue,
      this.strokeDasharrayValue,
      this.opacityValue,
    );

    return freezeSvgNode({
      kind: SvgNodeKind.Circle,
      ...createSvgNodeDefaults(),
      cx: this.cxValue,
      cy: this.cyValue,
      radius: this.radiusValue,
      style: styleOrEmpty(style),
    });
  }

  build(): TemplateResult {
    return litSvgNodeRenderer.render(this.buildNode());
  }
}

export class PolygonBuilder {
  private pointsValue = "";
  private fillValue?: string;
  private strokeValue?: string;
  private strokeWidthValue?: number;
  private strokeDasharrayValue?: string;
  private opacityValue?: number;

  points(value: string): this {
    if (value.trim() === "") {
      throw new Error("points must not be empty");
    }

    this.pointsValue = value;
    return this;
  }

  fill(value: string): this {
    this.fillValue = value;
    return this;
  }

  stroke(value: string): this {
    this.strokeValue = value;
    return this;
  }

  strokeWidth(value: number): this {
    assertNonNegative(value, "strokeWidth");
    this.strokeWidthValue = value;
    return this;
  }

  strokeDasharray(value: string): this {
    this.strokeDasharrayValue = value;
    return this;
  }

  opacity(value: number): this {
    assertNonNegative(value, "opacity");
    this.opacityValue = value;
    return this;
  }

  style(value: SvgStrokeFillStyle): this {
    return applyStrokeFillStyle(this, value);
  }

  buildNode(): SvgPolygonNode {
    const style = createStrokeFillStyle(
      this.fillValue,
      this.strokeValue,
      this.strokeWidthValue,
      this.strokeDasharrayValue,
      this.opacityValue,
    );

    return freezeSvgNode({
      kind: SvgNodeKind.Polygon,
      ...createSvgNodeDefaults(),
      points: this.pointsValue,
      style: styleOrEmpty(style),
    });
  }

  build(): TemplateResult {
    return litSvgNodeRenderer.render(this.buildNode());
  }
}

export class TextBuilder {
  private xValue = 0;
  private yValue = 0;
  private textValue = "";
  private fillValue?: string;
  private fontSizeValue = 12;
  private textAnchorValue: TextAnchor = "start";
  private baselineValue = "middle";

  x(value: number): this {
    assertFinite(value, "x");
    this.xValue = value;
    return this;
  }

  y(value: number): this {
    assertFinite(value, "y");
    this.yValue = value;
    return this;
  }

  value(text: string): this {
    this.textValue = text;
    return this;
  }

  fill(value: string): this {
    this.fillValue = value;
    return this;
  }

  fontSize(value: number): this {
    assertPositive(value, "fontSize");
    this.fontSizeValue = value;
    return this;
  }

  textAnchor(value: TextAnchor): this {
    this.textAnchorValue = value;
    return this;
  }

  baseline(value: string): this {
    this.baselineValue = value;
    return this;
  }

  buildNode(): SvgTextNode {
    const style = createStrokeFillStyle(
      this.fillValue,
      undefined,
      undefined,
      undefined,
      undefined,
    );

    return freezeSvgNode({
      kind: SvgNodeKind.Text,
      ...createSvgNodeDefaults(),
      x: this.xValue,
      y: this.yValue,
      value: this.textValue,
      fontSize: this.fontSizeValue,
      textAnchor: this.textAnchorValue,
      baseline: this.baselineValue,
      style: styleOrEmpty(style),
    });
  }

  build(): TemplateResult {
    return litSvgNodeRenderer.render(this.buildNode());
  }
}

export class GroupBuilder {
  private childNodes: SvgNode[] = [];

  children(...values: ReadonlyArray<SvgNode | readonly SvgNode[]>): this {
    this.childNodes = values.flat();
    return this;
  }

  buildNode(): SvgGroupNode {
    return freezeSvgNode({
      kind: SvgNodeKind.Group,
      ...createSvgNodeDefaults(),
      children: this.childNodes,
    });
  }

  build(): TemplateResult {
    return litSvgNodeRenderer.render(this.buildNode());
  }
}

export class SvgShapeTemplateFactory {
  svgNode(viewport: SvgViewport, children: SvgNode | readonly SvgNode[]): SvgRootNode {
    assertPositive(viewport.width, "viewport.width");
    assertPositive(viewport.height, "viewport.height");

    return freezeSvgNode({
      kind: SvgNodeKind.Svg,
      ...createSvgNodeDefaults(),
      viewport,
      children: Array.isArray(children) ? children : [children],
    });
  }

  svg(viewport: SvgViewport, children: SvgNode | readonly SvgNode[]): TemplateResult {
    return litSvgNodeRenderer.render(this.svgNode(viewport, children));
  }

  rect(): RectBuilder {
    return new RectBuilder();
  }

  circle(): CircleBuilder {
    return new CircleBuilder();
  }

  polygon(): PolygonBuilder {
    return new PolygonBuilder();
  }

  text(): TextBuilder {
    return new TextBuilder();
  }

  group(): GroupBuilder {
    return new GroupBuilder();
  }
}

export const svgShapeTemplateFactory = new SvgShapeTemplateFactory();
