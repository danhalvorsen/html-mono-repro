// // ============================================================================
// // FILE: packages/core-style-system/src/style/IShapeStyleToken.ts
// // ============================================================================
export {};
// import type { IShapeStyle } from './IShapeStyle.js';
// // ============================================================================
// // FILE: packages/core-style-system/src/style/IShapeStyleReference.ts
// // ============================================================================
// import type { IShapeStyle } from './IShapeStyle.js';
// // ============================================================================
// // FILE: packages/core-style-system/src/style/IShapeStyleLibrary.ts
// // ============================================================================
// // ============================================================================
// // FILE: packages/core-style-system/src/style/ShapeStyleLibrary.ts
// // ============================================================================
// import type { IShapeStyleToken } from './IShapeStyleToken.js';
// // ============================================================================
// // FILE: packages/core-style-system/src/style/style-tokens.ts
// // ============================================================================
// import type { IShapeStyleToken } from './IShapeStyleToken.js';
// // ============================================================================
// // FILE: packages/core-style-system/src/style/ShapeStyleResolver.ts
// // ============================================================================
// import type { IShapeStyle } from './IShapeStyle.js';
// import type { IShapeStyleLibrary } from './IShapeStyleLibrary.js';
// import type { IShapeStyleReference } from './IShapeStyleReference.js';
// import type { IShapeStyleToken } from './IShapeStyleToken.js';
// // ============================================================================
// // FILE: packages/core-style-system/src/index.ts
// // ============================================================================
// export * from './style/IShapeStyle.js';
// export * from './style/IShapeStyleLibrary.js';
// export * from './style/IShapeStyleReference.js';
// export * from './style/IShapeStyleToken.js';
// export * from './style/ShapeStyleLibrary.js';
// export * from './style/ShapeStyleResolver.js';
// export * from './style/style-tokens.js';
// // ============================================================================
// // FILE: Applications/composite-tree-demo/composite-tree/src/shape-model.ts
// // ============================================================================
// import type { IShapeStyleReference } from '@monorepo/core-style-system';
// export type ShapeKind =
//   | 'group'
//   | 'grid'
//   | 'line'
//   | 'polygon'
//   | 'circle'
//   | 'ellipse'
//   | 'vertex';
// export interface IPoint {
//   readonly x: number;
//   readonly y: number;
// }
// export interface IShape {
//   readonly id: string;
//   readonly kind: ShapeKind;
//   readonly style?: IShapeStyleReference;
// }
// export interface IVertex extends IShape {
//   readonly kind: 'vertex';
//   readonly point: IPoint;
//   readonly marker: 'circle' | 'arrow';
//   readonly size: number;
//   readonly rotation?: number;
// }
// export interface IEdge {
//   readonly id: string;
//   readonly from: IVertex;
//   readonly to: IVertex;
//   readonly style?: IShapeStyleReference;
// }
// export interface IPolygon extends IShape {
//   readonly kind: 'polygon';
//   readonly vertices: readonly IVertex[];
//   readonly edges: readonly IEdge[];
//   readonly closed: boolean;
// }
// export interface ICircleShape extends IShape {
//   readonly kind: 'circle';
//   readonly center: IPoint;
//   readonly radius: number;
// }
// export interface IEllipseShape extends IShape {
//   readonly kind: 'ellipse';
//   readonly center: IPoint;
//   readonly radiusX: number;
//   readonly radiusY: number;
// }
// export interface ILineShape extends IShape {
//   readonly kind: 'line';
//   readonly start: IPoint;
//   readonly end: IPoint;
//   readonly startVertex?: IVertex;
//   readonly endVertex?: IVertex;
// }
// export interface IGridShape extends IShape {
//   readonly kind: 'grid';
//   readonly width: number;
//   readonly height: number;
//   readonly spacing: number;
//   readonly majorEvery: number;
// }
// export interface IShapeGroup extends IShape {
//   readonly kind: 'group';
//   readonly shapes: readonly DrawableShape[];
// }
// export interface ICoordinateSystemShape extends IShapeGroup {
//   readonly grid: IGridShape;
//   readonly xAxis: ILineShape;
//   readonly yAxis: ILineShape;
// }
// export type DrawableShape =
//   | ICoordinateSystemShape
//   | IShapeGroup
//   | IGridShape
//   | ILineShape
//   | IPolygon
//   | ICircleShape
//   | IEllipseShape
//   | IVertex;
// const point = (x: number, y: number): IPoint => ({ x, y });
// let nextShapeId = 0;
// const shapeId = (prefix: string): string => `${prefix}-${nextShapeId++}`;
// export class VertexShape implements IVertex {
//   public readonly id: string;
//   public readonly kind = 'vertex' as const;
//   public constructor(
//     public readonly point: IPoint,
//     public readonly marker: 'circle' | 'arrow' = 'circle',
//     public readonly size = 8,
//     public readonly rotation = 0,
//     public readonly style?: IShapeStyleReference,
//     id?: string,
//   ) {
//     this.id = id ?? shapeId('vertex');
//   }
// }
// export class Edge implements IEdge {
//   public readonly id: string;
//   public constructor(
//     public readonly from: IVertex,
//     public readonly to: IVertex,
//     public readonly style?: IShapeStyleReference,
//     id?: string,
//   ) {
//     this.id = id ?? shapeId('edge');
//   }
// }
// export class PolygonShape implements IPolygon {
//   public readonly id: string;
//   public readonly kind = 'polygon' as const;
//   public readonly edges: readonly IEdge[];
//   public constructor(
//     public readonly vertices: readonly IVertex[],
//     public readonly closed = true,
//     public readonly style?: IShapeStyleReference,
//     id?: string,
//   ) {
//     this.id = id ?? shapeId('polygon');
//     this.edges = PolygonShape.createEdges(vertices, closed, style);
//   }
//   private static createEdges(
//     vertices: readonly IVertex[],
//     closed: boolean,
//     style?: IShapeStyleReference,
//   ): readonly IEdge[] {
//     if (vertices.length < 2) {
//       return [];
//     }
//     const edges: IEdge[] = [];
//     for (let index = 0; index < vertices.length - 1; index += 1) {
//       const from = vertices[index];
//       const to = vertices[index + 1];
//       if (from === undefined || to === undefined) {
//         continue;
//       }
//       edges.push(new Edge(from, to, style));
//     }
//     if (closed) {
//       const last = vertices[vertices.length - 1];
//       const first = vertices[0];
//       if (last !== undefined && first !== undefined) {
//         edges.push(new Edge(last, first, style));
//       }
//     }
//     return edges;
//   }
// }
// export class CircleShape implements ICircleShape {
//   public readonly id: string;
//   public readonly kind = 'circle' as const;
//   public constructor(
//     public readonly center: IPoint,
//     public readonly radius: number,
//     public readonly style?: IShapeStyleReference,
//     id?: string,
//   ) {
//     this.id = id ?? shapeId('circle');
//   }
// }
// export class EllipseShape implements IEllipseShape {
//   public readonly id: string;
//   public readonly kind = 'ellipse' as const;
//   public constructor(
//     public readonly center: IPoint,
//     public readonly radiusX: number,
//     public readonly radiusY: number,
//     public readonly style?: IShapeStyleReference,
//     id?: string,
//   ) {
//     this.id = id ?? shapeId('ellipse');
//   }
// }
// export class LineShape implements ILineShape {
//   public readonly id: string;
//   public readonly kind = 'line' as const;
//   public constructor(
//     public readonly start: IPoint,
//     public readonly end: IPoint,
//     public readonly style?: IShapeStyleReference,
//     public readonly startVertex?: IVertex,
//     public readonly endVertex?: IVertex,
//     id?: string,
//   ) {
//     this.id = id ?? shapeId('line');
//   }
// }
// export class GridShape implements IGridShape {
//   public readonly id: string;
//   public readonly kind = 'grid' as const;
//   public constructor(
//     public readonly width: number,
//     public readonly height: number,
//     public readonly spacing: number,
//     public readonly majorEvery: number,
//     public readonly style?: IShapeStyleReference,
//     id?: string,
//   ) {
//     this.id = id ?? shapeId('grid');
//   }
// }
// export class ShapeGroup implements IShapeGroup {
//   public readonly id: string;
//   public readonly kind = 'group' as const;
//   public constructor(
//     public readonly shapes: readonly DrawableShape[],
//     public readonly style?: IShapeStyleReference,
//     id?: string,
//   ) {
//     this.id = id ?? shapeId('group');
//   }
// }
// export class CoordinateSystemShape
//   extends ShapeGroup
//   implements ICoordinateSystemShape
// {
//   public constructor(
//     public readonly grid: IGridShape,
//     public readonly xAxis: ILineShape,
//     public readonly yAxis: ILineShape,
//     id?: string,
//   ) {
//     super([grid, xAxis, yAxis], undefined, id);
//   }
// }
// export const createCircleVertex = (
//   x: number,
//   y: number,
//   size = 6,
//   style?: IShapeStyleReference,
// ): IVertex => new VertexShape(point(x, y), 'circle', size, 0, style);
// export const createArrowVertex = (
//   x: number,
//   y: number,
//   rotation: number,
//   size = 12,
//   style?: IShapeStyleReference,
// ): IVertex => new VertexShape(point(x, y), 'arrow', size, rotation, style);
// export const createCoordinateSystem = (
//   width: number,
//   height: number,
//   spacing: number,
// ): ICoordinateSystemShape => {
//   const halfWidth = width / 2;
//   const halfHeight = height / 2;
//   const grid = new GridShape(
//     width,
//     height,
//     spacing,
//     5,
//     { token: 'grid' },
//   );
//   const xAxis = new LineShape(
//     point(-halfWidth, 0),
//     point(halfWidth, 0),
//     { token: 'axis' },
//     createArrowVertex(-halfWidth, 0, 180, 12, { token: 'axis' }),
//     createArrowVertex(halfWidth, 0, 0, 12, { token: 'axis' }),
//   );
//   const yAxis = new LineShape(
//     point(0, -halfHeight),
//     point(0, halfHeight),
//     { token: 'axis' },
//     createArrowVertex(0, -halfHeight, -90, 12, { token: 'axis' }),
//     createArrowVertex(0, halfHeight, 90, 12, { token: 'axis' }),
//   );
//   return new CoordinateSystemShape(grid, xAxis, yAxis);
// };
// // ============================================================================
// // FILE: Applications/composite-tree-demo/composite-tree/src/style/ShapeStyleElement.ts
// // ============================================================================
// import { LitElement, nothing } from 'lit';
// import { customElement, property } from 'lit/decorators.js';
// import type {
//   IShapeStyle,
//   IShapeStyleReference,
// } from '@monorepo/core-style-system';
// @customElement('shape-style')
// export class ShapeStyleElement extends LitElement {
//   @property()
//   public token?: string;
//   @property({ attribute: 'stroke-color' })
//   public strokeColor?: string;
//   @property({ attribute: 'fill-color' })
//   public fillColor?: string;
//   @property({ attribute: 'stroke-width', type: Number })
//   public strokeWidth?: number;
//   @property({ attribute: 'stroke-dash' })
//   public strokeDash?: string;
//   @property({ type: Number })
//   public opacity?: number;
//   public toStyleReference(): IShapeStyleReference {
//     const stroke = this.buildStroke();
//     const fill = this.fillColor !== undefined ? { color: this.fillColor } : undefined;
//     const overrides: IShapeStyle = {
//       ...(stroke !== undefined ? { stroke } : {}),
//       ...(fill !== undefined ? { fill } : {}),
//       ...(this.opacity !== undefined ? { opacity: this.opacity } : {}),
//     };
//     return {
//       ...(this.token !== undefined ? { token: this.token } : {}),
//       ...(Object.keys(overrides).length > 0 ? { overrides } : {}),
//     };
//   }
//   protected override createRenderRoot(): HTMLElement {
//     return this;
//   }
//   protected override render() {
//     return nothing;
//   }
//   private buildStroke():
//     | { color?: string; width?: number; dash?: readonly number[] }
//     | undefined {
//     const dash = this.parseDash(this.strokeDash);
//     const stroke = {
//       ...(this.strokeColor !== undefined ? { color: this.strokeColor } : {}),
//       ...(this.strokeWidth !== undefined ? { width: this.strokeWidth } : {}),
//       ...(dash !== undefined ? { dash } : {}),
//     };
//     return Object.keys(stroke).length > 0 ? stroke : undefined;
//   }
//   private parseDash(value?: string): readonly number[] | undefined {
//     if (value === undefined || value.trim().length === 0) {
//       return undefined;
//     }
//     const numbers = value
//       .split(/[ ,]+/)
//       .map((part) => Number(part))
//       .filter((part) => Number.isFinite(part) && part >= 0);
//     return numbers.length > 0 ? numbers : undefined;
//   }
// }
// // ============================================================================
// // FILE: Applications/composite-tree-demo/composite-tree/src/ShapeElement.ts
// // ============================================================================
// import { LitElement, nothing } from 'lit';
// import type { DrawableShape } from './shape-model.js';
// import type { IShapeStyleReference } from '@monorepo/core-style-system';
// import { ShapeStyleElement } from './style/ShapeStyleElement.js';
// export abstract class ShapeElement extends LitElement {
//   public abstract toShape(): DrawableShape;
//   protected getStyleReference(): IShapeStyleReference | undefined {
//     const styleElement = this.querySelector('shape-style');
//     if (!(styleElement instanceof ShapeStyleElement)) {
//       return undefined;
//     }
//     return styleElement.toStyleReference();
//   }
//   protected override createRenderRoot(): HTMLElement {
//     return this;
//   }
//   protected override render() {
//     return nothing;
//   }
// }
// // ============================================================================
// // FILE: Applications/composite-tree-demo/composite-tree/src/CircleShapeElement.ts
// // ============================================================================
// import { customElement, property } from 'lit/decorators.js';
// import { ShapeElement } from './ShapeElement.js';
// import { CircleShape } from './shape-model.js';
// import type { ICircleShape } from './shape-model.js';
// @customElement('circle-shape')
// export class CircleShapeElement extends ShapeElement {
//   @property({ type: Number })
//   public cx = 0;
//   @property({ type: Number })
//   public cy = 0;
//   @property({ type: Number })
//   public r = 50;
//   public override toShape(): ICircleShape {
//     return new CircleShape(
//       { x: this.cx, y: this.cy },
//       this.r,
//       this.getStyleReference(),
//     );
//   }
// }
// // ============================================================================
// // FILE: Applications/composite-tree-demo/composite-tree/src/style/SvgShapeStyleAdapter.ts
// // ============================================================================
// import type { IShapeStyle } from '@monorepo/core-style-system';
// export interface ISvgShapeStyle {
//   readonly stroke: string;
//   readonly fill: string;
//   readonly strokeWidth: number;
//   readonly strokeDasharray: string;
//   readonly opacity: number;
// }
// export class SvgShapeStyleAdapter {
//   public adapt(style?: Readonly<IShapeStyle>): ISvgShapeStyle {
//     return {
//       stroke: style?.stroke?.color ?? 'transparent',
//       fill: style?.fill?.color ?? 'transparent',
//       strokeWidth: style?.stroke?.width ?? 1,
//       strokeDasharray: (style?.stroke?.dash ?? []).join(' '),
//       opacity: style?.opacity ?? 1,
//     };
//   }
// }
// // ============================================================================
// // FILE: Applications/composite-tree-demo/composite-tree/src/CartesianSvgCanvasElement.ts
// // only style-related parts shown
// // ============================================================================
// import { LitElement, svg, type SVGTemplateResult } from 'lit';
// import type { ICircleShape } from './shape-model.js';
// import {
//   ShapeStyleLibrary,
//   ShapeStyleResolver,
//   STYLE_TOKENS,
// } from '@monorepo/core-style-system';
// import { SvgShapeStyleAdapter } from './style/SvgShapeStyleAdapter.js';
// export abstract class CartesianSvgCanvasElement extends LitElement {
//   private readonly styleResolver = new ShapeStyleResolver([
//     new ShapeStyleLibrary(STYLE_TOKENS),
//   ]);
//   private readonly svgStyleAdapter = new SvgShapeStyleAdapter();
//   protected renderCircle(shape: ICircleShape): SVGTemplateResult {
//     const resolvedStyle = this.styleResolver.resolve(shape.style);
//     const svgStyle = this.svgStyleAdapter.adapt(resolvedStyle);
//     return svg`<circle
//       data-shape-id=${shape.id}
//       cx=${shape.center.x}
//       cy=${shape.center.y}
//       r=${shape.radius}
//       stroke=${svgStyle.stroke}
//       fill=${svgStyle.fill}
//       stroke-width=${svgStyle.strokeWidth}
//       stroke-dasharray=${svgStyle.strokeDasharray}
//       opacity=${svgStyle.opacity}
//     ></circle>`;
//   }
// }
// // ============================================================================
// // SAMPLE USAGE
// // ============================================================================
// /*
// html`
//   <shape-cartesian-canvas .canvasWidth=${760} .canvasHeight=${520}>
//     <circle-shape .cx=${-220} .cy=${130} .r=${52}>
//       <shape-style token="circle-primary"></shape-style>
//     </circle-shape>
//     <circle-shape .cx=${80} .cy=${40} .r=${36}>
//       <shape-style
//         token="surface"
//         stroke-color="#2563eb"
//         fill-color="rgba(37, 99, 235, 0.18)"
//         stroke-width="3"
//         stroke-dash="6 3"
//       ></shape-style>
//     </circle-shape>
//   </shape-cartesian-canvas>
// `;
// */
//# sourceMappingURL=style-tokens.js.map