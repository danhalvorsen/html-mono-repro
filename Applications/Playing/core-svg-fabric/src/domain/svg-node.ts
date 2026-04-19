import {
  IDENTITY_MATRIX_3X3,
  type Matrix3x3,
} from "./matrix3x3.js";

export enum SvgNodeKind {
  Svg = "svg",
  Group = "group",
  Rect = "rect",
  Circle = "circle",
  Polygon = "polygon",
  Text = "text",
}

export interface SvgStrokeFillStyle {
  readonly fill?: string;
  readonly stroke?: string;
  readonly strokeWidth?: number;
  readonly strokeDasharray?: string;
  readonly opacity?: number;
}

export interface SvgViewport {
  readonly width: number;
  readonly height: number;
  readonly role?: string;
  readonly ariaHidden?: boolean;
}

export interface SvgNodeBase {
  readonly kind: SvgNodeKind;
  readonly style: SvgStrokeFillStyle;
  readonly transform: Matrix3x3;
  readonly children: readonly SvgNode[];
}

export interface SvgRootNode extends SvgNodeBase {
  readonly kind: SvgNodeKind.Svg;
  readonly viewport: SvgViewport;
}

export interface SvgGroupNode extends SvgNodeBase {
  readonly kind: SvgNodeKind.Group;
}

export interface SvgRectNode extends SvgNodeBase {
  readonly kind: SvgNodeKind.Rect;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly rx?: number;
  readonly ry?: number;
}

export interface SvgCircleNode extends SvgNodeBase {
  readonly kind: SvgNodeKind.Circle;
  readonly cx: number;
  readonly cy: number;
  readonly radius: number;
}

export interface SvgPolygonNode extends SvgNodeBase {
  readonly kind: SvgNodeKind.Polygon;
  readonly points: string;
}

export interface SvgTextNode extends SvgNodeBase {
  readonly kind: SvgNodeKind.Text;
  readonly x: number;
  readonly y: number;
  readonly value: string;
  readonly fontSize: number;
  readonly textAnchor: "start" | "middle" | "end";
  readonly baseline: string;
}

export type SvgNode =
  | SvgRootNode
  | SvgGroupNode
  | SvgRectNode
  | SvgCircleNode
  | SvgPolygonNode
  | SvgTextNode;

export interface SvgNodeRenderer<TNode extends SvgNode = SvgNode, TResult = unknown> {
  render(node: TNode): TResult;
}

export const EMPTY_SVG_STYLE: SvgStrokeFillStyle = Object.freeze({});

export function freezeSvgNode<TNode extends SvgNode>(node: TNode): TNode {
  const frozenChildren = node.children.map((child) => freezeSvgNode(child));
  const nodeWithFrozenChildren = {
    ...node,
    style: Object.freeze({ ...node.style }),
    transform: Object.freeze([
      Object.freeze([...node.transform[0]]),
      Object.freeze([...node.transform[1]]),
      Object.freeze([...node.transform[2]]),
    ]) as Matrix3x3,
    children: Object.freeze(frozenChildren),
  };

  if ("viewport" in nodeWithFrozenChildren) {
    return Object.freeze({
      ...nodeWithFrozenChildren,
      viewport: Object.freeze({ ...nodeWithFrozenChildren.viewport }),
    }) as unknown as TNode;
  }

  return Object.freeze(nodeWithFrozenChildren) as unknown as TNode;
}

export function createSvgNodeDefaults(): Pick<SvgNodeBase, "style" | "transform" | "children"> {
  return {
    style: EMPTY_SVG_STYLE,
    transform: IDENTITY_MATRIX_3X3,
    children: Object.freeze([]),
  };
}
