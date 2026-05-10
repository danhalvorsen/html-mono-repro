export interface SvgShapeDocument {
  readonly name: string;
  readonly rootName: string;
  readonly shapes: readonly SvgShape[];
}

export interface SvgShape {
  readonly rootName: string;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly aspect: string;
  readonly strokeWidth: string;
  readonly connections: readonly SvgShapeConnection[];
  readonly background: readonly SvgElement[];
  readonly foreground: readonly SvgElement[];
}

export interface SvgShapeConnection {
  readonly name: string;
  readonly x: number;
  readonly y: number;
  readonly perimeter: string;
}

export type SvgElement = SvgPathElement | SvgEllipseElement;

export interface SvgElementStyle {
  readonly fill: string;
  readonly stroke: string;
  readonly strokeWidth: string;
  readonly strokeLineJoin: string | undefined;
}

export interface SvgPathElement extends SvgElementStyle {
  readonly kind: "path";
  readonly d: string;
}

export interface SvgEllipseElement extends SvgElementStyle {
  readonly kind: "ellipse";
  readonly cx: number;
  readonly cy: number;
  readonly rx: number;
  readonly ry: number;
}