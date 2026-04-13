import {
  SemanticShapesComposition,
  type IRectangleShape,
} from "@monorepo/core-semantic-model-shapes";

import { createButtonRectangleShape } from "./button-rectangle-shape.js";

const rectangleFactory = new SemanticShapesComposition().rectangleFactory;

export type SvgLabelPlacement = "top" | "bottom" | "left" | "right" | "center";
export type SvgLabelAlignment = "start" | "center" | "end";
export type SvgLabelAttachment = "inside" | "outside" | "overlay";

export interface ICreateSvgRgbLabelButtonLayoutInput {
  readonly width: number;
  readonly height: number;
  readonly labelMargin: number;
  readonly labelPlacement: SvgLabelPlacement;
  readonly labelAlignment: SvgLabelAlignment;
  readonly labelAttachment: SvgLabelAttachment;
  readonly labelGap: number;
  readonly labelSpan: number;
}

export interface ISvgRgbLabelButtonLayout {
  readonly bounds: IRectangleShape;
  readonly button: IRectangleShape;
  readonly label: IRectangleShape;
}

export interface IRectangleFrame {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface ISvgRgbLabelButtonResolvedLayout
  extends ISvgRgbLabelButtonLayout {
  readonly boundsFrame: IRectangleFrame;
  readonly buttonFrame: IRectangleFrame;
  readonly labelFrame: IRectangleFrame;
}

export function createSvgRgbLabelButtonLayout(
  input: ICreateSvgRgbLabelButtonLayoutInput,
): ISvgRgbLabelButtonResolvedLayout {
  const labelFrame = resolveSemanticLabelFrame(input);
  const button = createButtonRectangleShape(rectangleFactory, {
    id: "svg-rgb-label-button.button",
    x: 0,
    y: 0,
    width: input.width,
    height: input.height,
  });

  const label = createButtonRectangleShape(rectangleFactory, {
    id: "svg-rgb-label-button.label",
    x: labelFrame.x,
    y: labelFrame.y,
    width: labelFrame.width,
    height: labelFrame.height,
    properties: createSemanticProperties(input),
  });

  const buttonFrame = resolveRectangleFrame(button);
  const resolvedLabelFrame = resolveRectangleFrame(label);
  const minX = Math.min(buttonFrame.x, labelFrame.x);
  const minY = Math.min(buttonFrame.y, labelFrame.y);
  const maxX = Math.max(
    buttonFrame.x + buttonFrame.width,
    resolvedLabelFrame.x + resolvedLabelFrame.width,
  );
  const maxY = Math.max(
    buttonFrame.y + buttonFrame.height,
    resolvedLabelFrame.y + resolvedLabelFrame.height,
  );

  const bounds = createButtonRectangleShape(rectangleFactory, {
    id: "svg-rgb-label-button.bounds",
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  });
  const boundsFrame = resolveRectangleFrame(bounds);

  return Object.freeze({
    bounds,
    button,
    label,
    boundsFrame,
    buttonFrame,
    labelFrame: resolvedLabelFrame,
  });
}

function resolveSemanticLabelFrame(
  input: ICreateSvgRgbLabelButtonLayoutInput,
): IRectangleFrame {
  const span = clamp01(input.labelSpan);
  const gap = Math.max(0, input.labelGap);
  const marginX = clampMargin(input.width, input.labelMargin);
  const marginY = clampMargin(input.height, input.labelMargin);
  const horizontal = input.labelPlacement === "top"
    || input.labelPlacement === "bottom"
    || input.labelPlacement === "center";
  const labelThickness = horizontal
    ? Math.max(12, Math.round(input.height * 0.2))
    : Math.max(12, Math.round(input.width * 0.25));
  const usableWidth = Math.max(12, input.width - marginX * 2);
  const usableHeight = Math.max(12, input.height - marginY * 2);
  const desiredLabelWidth = horizontal
    ? Math.max(12, Math.round(input.width * span))
    : labelThickness;
  const desiredLabelHeight = horizontal
    ? labelThickness
    : Math.max(12, Math.round(input.height * span));
  const labelWidth = Math.min(desiredLabelWidth, usableWidth);
  const labelHeight = Math.min(desiredLabelHeight, usableHeight);

  switch (input.labelPlacement) {
    case "top":
      return Object.freeze({
        x: alignAxis(usableWidth, labelWidth, input.labelAlignment, marginX),
        y:
          input.labelAttachment === "outside"
            ? -(labelHeight + gap)
            : marginY,
        width: labelWidth,
        height: labelHeight,
      });
    case "bottom":
      return Object.freeze({
        x: alignAxis(usableWidth, labelWidth, input.labelAlignment, marginX),
        y:
          input.labelAttachment === "outside"
            ? input.height + gap
            : input.height - labelHeight - marginY,
        width: labelWidth,
        height: labelHeight,
      });
    case "left":
      return Object.freeze({
        x: input.labelAttachment === "outside" ? -(labelWidth + gap) : marginX,
        y: alignAxis(usableHeight, labelHeight, input.labelAlignment, marginY),
        width: labelWidth,
        height: labelHeight,
      });
    case "right":
      return Object.freeze({
        x:
          input.labelAttachment === "outside"
            ? input.width + gap
            : input.width - labelWidth - marginX,
        y: alignAxis(usableHeight, labelHeight, input.labelAlignment, marginY),
        width: labelWidth,
        height: labelHeight,
      });
    case "center":
    default:
      return Object.freeze({
        x: alignAxis(usableWidth, labelWidth, "center", marginX),
        y: alignAxis(usableHeight, labelHeight, "center", marginY),
        width: labelWidth,
        height: labelHeight,
      });
  }
}

function createSemanticProperties(
  input: ICreateSvgRgbLabelButtonLayoutInput,
): readonly Readonly<{ key: string; value: unknown }>[] {
  return Object.freeze([
    Object.freeze({ key: "labelPlacement", value: input.labelPlacement }),
    Object.freeze({ key: "labelAlignment", value: input.labelAlignment }),
    Object.freeze({ key: "labelAttachment", value: input.labelAttachment }),
    Object.freeze({ key: "labelMargin", value: input.labelMargin }),
    Object.freeze({ key: "labelGap", value: input.labelGap }),
    Object.freeze({ key: "labelSpan", value: input.labelSpan }),
  ]);
}

function alignAxis(
  usableSize: number,
  contentSize: number,
  alignment: SvgLabelAlignment,
  offset: number,
): number {
  switch (alignment) {
    case "start":
      return offset;
    case "end":
      return offset + usableSize - contentSize;
    case "center":
    default:
      return offset + (usableSize - contentSize) / 2;
  }
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(1, Math.max(0.1, value));
}

function clampMargin(size: number, percent: number): number {
  if (!Number.isFinite(percent) || percent < 0) {
    return 0;
  }

  return Math.min(size / 2, (size * percent) / 100);
}

function resolveRectangleFrame(shape: IRectangleShape): IRectangleFrame {
  const xs = shape.topology.vertices.map((vertex) => vertex.position.x);
  const ys = shape.topology.vertices.map((vertex) => vertex.position.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return Object.freeze({
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  });
}
