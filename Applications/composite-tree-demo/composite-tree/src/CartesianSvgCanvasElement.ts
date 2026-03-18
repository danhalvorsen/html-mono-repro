import { LitElement, type TemplateResult, html, type SVGTemplateResult, svg, css } from 'lit';
import { property } from 'lit/decorators.js';
import type { IStyleReference } from '@monorepo/core-style-system';
import type { IPolygon, ICircleShape, IVertex, IPoint } from './shape-model';
import type { ICoordinateSystemShape } from "./ICoordinateSystemShape";
import type { DrawableShape } from "./DrawableShape";
import type { IEllipseShape } from "./IEllipseShape";
import type { IShapeGroup } from "./IShapeGroup";
import type { IGridShape } from "./IGridShape";
import type { ILineShape } from "./ILineShape";
import { appStyleResolver } from './rendering/AppStyleResolver';
import { SvgStyleAdapter, type ISvgStyle } from './rendering/SvgStyleAdapter';

export abstract class CartesianSvgCanvasElement extends LitElement {
    private readonly styleResolver = appStyleResolver;
    private readonly styleAdapter = new SvgStyleAdapter();

    @property({ attribute: false })
    public shapes: readonly DrawableShape[] = [];

    @property({ type: Number })
    public canvasWidth = 760;

    @property({ type: Number })
    public canvasHeight = 520;

    protected abstract renderScene(): readonly DrawableShape[];

    protected override render(): TemplateResult {
        const shapes = this.renderScene();

        return html`
      <svg
        class="canvas"
        viewBox=${`0 0 ${this.canvasWidth} ${this.canvasHeight}`}
        role="img"
        aria-label="SVG shapes drawn in a Cartesian coordinate system"
      >
        <rect
          class="paper"
          x="0"
          y="0"
          width=${this.canvasWidth}
          height=${this.canvasHeight}
          rx="22"
          ry="22"
        ></rect>
        <g transform=${`translate(${this.canvasWidth / 2} ${this.canvasHeight / 2}) scale(1 -1)`}>
          ${shapes.map((shape) => this.renderShape(shape))}
        </g>
      </svg>
    `;
    }

    private resolveStyle(reference?: Readonly<IStyleReference>): ISvgStyle {
        return this.styleAdapter.adapt(this.styleResolver.resolve(reference));
    }

    protected renderShape(shape: DrawableShape): SVGTemplateResult {
        switch (shape.kind) {
            case 'group':
                return this.renderGroup(shape);
            case 'grid':
                return this.renderGrid(shape);
            case 'line':
                return this.renderLine(shape);
            case 'polygon':
                return this.renderPolygon(shape);
            case 'circle':
                return this.renderCircle(shape);
            case 'ellipse':
                return this.renderEllipse(shape);
            case 'vertex':
                return this.renderVertex(shape);
            default: {
                const unhandled: never = shape;
                throw new Error(`Unsupported shape kind: ${(unhandled as { kind?: string }).kind ?? 'unknown'}`);
            }
        }
    }

    private renderGroup(shape: IShapeGroup | ICoordinateSystemShape): SVGTemplateResult {
        if (this.isCoordinateSystemShape(shape)) {
            return svg`
        <g data-shape-id=${shape.id}>
          ${shape.shapes.map((child) => this.renderShape(child))}
          ${this.renderAxisLabels(shape)}
          <circle cx="0" cy="0" r="4.5" fill="#0f172a" opacity="0.9"></circle>
        </g>`;
        }

        return svg`<g data-shape-id=${shape.id}>${shape.shapes.map((child) => this.renderShape(child))}</g>`;
    }

    private isCoordinateSystemShape(shape: IShapeGroup | ICoordinateSystemShape): shape is ICoordinateSystemShape {
        return 'grid' in shape && 'xAxis' in shape && 'yAxis' in shape;
    }

    private renderAxisLabels(shape: ICoordinateSystemShape): SVGTemplateResult {
        const xLabelX = shape.xAxis.end.x - 22;
        const xLabelY = shape.xAxis.end.y - 18;
        const yLabelX = shape.yAxis.end.x + 18;
        const yLabelY = shape.yAxis.end.y - 20;

        return svg`
      <g transform="scale(1 -1)">
        <text
          x=${xLabelX}
          y=${-xLabelY}
          fill="#991b1b"
          font-size="18"
          font-weight="700"
          font-family="Segoe UI, sans-serif"
        >x</text>
        <text
          x=${yLabelX}
          y=${-yLabelY}
          fill="#1d4ed8"
          font-size="18"
          font-weight="700"
          font-family="Segoe UI, sans-serif"
        >y</text>
        <text
          x="10"
          y="18"
          fill="#334155"
          font-size="13"
          font-weight="600"
          font-family="Segoe UI, sans-serif"
        >0</text>
      </g>`;
    }

    private renderGrid(shape: IGridShape): SVGTemplateResult {
        const halfWidth = shape.width / 2;
        const halfHeight = shape.height / 2;
        const lines: SVGTemplateResult[] = [];
        const gridStyle = this.resolveStyle(shape.style);

        for (let x = -halfWidth; x <= halfWidth; x += shape.spacing) {
            if (x === 0) {
                continue;
            }

            const isMajor = Math.round(Math.abs(x) / shape.spacing) % shape.majorEvery === 0;
            lines.push(svg`<line
        x1=${x}
        y1=${-halfHeight}
        x2=${x}
        y2=${halfHeight}
        stroke=${isMajor ? '#94a3b8' : gridStyle.stroke}
        stroke-width=${isMajor ? 1.2 : gridStyle.strokeWidth}
        stroke-dasharray=${isMajor ? '' : gridStyle.strokeDasharray}
        opacity=${isMajor ? 0.85 : gridStyle.opacity}
      ></line>`);
        }

        for (let y = -halfHeight; y <= halfHeight; y += shape.spacing) {
            if (y === 0) {
                continue;
            }

            const isMajor = Math.round(Math.abs(y) / shape.spacing) % shape.majorEvery === 0;
            lines.push(svg`<line
        x1=${-halfWidth}
        y1=${y}
        x2=${halfWidth}
        y2=${y}
        stroke=${isMajor ? '#94a3b8' : gridStyle.stroke}
        stroke-width=${isMajor ? 1.2 : gridStyle.strokeWidth}
        stroke-dasharray=${isMajor ? '' : gridStyle.strokeDasharray}
        opacity=${isMajor ? 0.85 : gridStyle.opacity}
      ></line>`);
        }

        return svg`<g data-shape-id=${shape.id}>${lines}</g>`;
    }

    private renderLine(shape: ILineShape): SVGTemplateResult {
        const lineStyle = this.resolveStyle(shape.style);

        return svg`
      <g data-shape-id=${shape.id}>
        <line
          x1=${shape.start.x}
          y1=${shape.start.y}
          x2=${shape.end.x}
          y2=${shape.end.y}
          stroke=${lineStyle.stroke}
          stroke-width=${lineStyle.strokeWidth}
          stroke-dasharray=${lineStyle.strokeDasharray}
          opacity=${lineStyle.opacity}
        ></line>
        ${shape.startVertex ? this.renderVertex(shape.startVertex) : svg``}
        ${shape.endVertex ? this.renderVertex(shape.endVertex) : svg``}
      </g>
    `;
    }

    private renderPolygon(shape: IPolygon): SVGTemplateResult {
        const points = shape.vertices.map((vertex) => `${vertex.point.x},${vertex.point.y}`).join(' ');
        const polygonStyle = this.resolveStyle(shape.style);

        return svg`
      <g data-shape-id=${shape.id}>
        <polygon
          points=${points}
          stroke=${polygonStyle.stroke}
          fill=${polygonStyle.fill}
          stroke-width=${polygonStyle.strokeWidth}
          stroke-dasharray=${polygonStyle.strokeDasharray}
          opacity=${polygonStyle.opacity}
        ></polygon>
        ${shape.vertices.map((vertex) => this.renderVertex(vertex))}
      </g>
    `;
    }

    private renderCircle(shape: ICircleShape): SVGTemplateResult {
        const circleStyle = this.resolveStyle(shape.style);

        return svg`<circle
      data-shape-id=${shape.id}
      cx=${shape.center.x}
      cy=${shape.center.y}
      r=${shape.radius}
      stroke=${circleStyle.stroke}
      fill=${circleStyle.fill}
      stroke-width=${circleStyle.strokeWidth}
      stroke-dasharray=${circleStyle.strokeDasharray}
      opacity=${circleStyle.opacity}
    ></circle>`;
    }

    private renderEllipse(shape: IEllipseShape): SVGTemplateResult {
        const ellipseStyle = this.resolveStyle(shape.style);

        return svg`<ellipse
      data-shape-id=${shape.id}
      cx=${shape.center.x}
      cy=${shape.center.y}
      rx=${shape.radiusX}
      ry=${shape.radiusY}
      stroke=${ellipseStyle.stroke}
      fill=${ellipseStyle.fill}
      stroke-width=${ellipseStyle.strokeWidth}
      stroke-dasharray=${ellipseStyle.strokeDasharray}
      opacity=${ellipseStyle.opacity}
    ></ellipse>`;
    }

    private renderVertex(shape: IVertex): SVGTemplateResult {
        if (shape.marker === 'arrow') {
            const arrowPoints = this.arrowPoints(shape.point, shape.size, shape.rotation ?? 0);
            const arrowStyle = this.resolveStyle(shape.style);

            return svg`<polygon
        data-shape-id=${shape.id}
        points=${arrowPoints}
        stroke=${arrowStyle.stroke}
        fill=${arrowStyle.fill}
        stroke-width=${arrowStyle.strokeWidth}
        opacity=${arrowStyle.opacity}
      ></polygon>`;
        }

        const vertexStyle = this.resolveStyle(shape.style);

        return svg`<circle
      data-shape-id=${shape.id}
      cx=${shape.point.x}
      cy=${shape.point.y}
      r=${shape.size}
      stroke=${vertexStyle.stroke}
      fill=${vertexStyle.fill}
      stroke-width=${vertexStyle.strokeWidth}
      opacity=${vertexStyle.opacity}
    ></circle>`;
    }

    private arrowPoints(center: IPoint, size: number, rotationDegrees: number): string {
        const base = [
            { x: size, y: 0 },
            { x: -size * 0.55, y: size * 0.48 },
            { x: -size * 0.2, y: 0 },
            { x: -size * 0.55, y: -size * 0.48 },
        ];
        const radians = (rotationDegrees * Math.PI) / 180;
        const cosine = Math.cos(radians);
        const sine = Math.sin(radians);

        return base
            .map((vertex) => {
                const x = center.x + vertex.x * cosine - vertex.y * sine;
                const y = center.y + vertex.x * sine + vertex.y * cosine;
                return `${x},${y}`;
            })
            .join(' ');
    }

    public static override styles = css`
    :host {
      display: block;
    }

    .canvas {
      width: min(100%, 760px);
      height: auto;
      display: block;
      filter: drop-shadow(0 28px 38px rgba(15, 23, 42, 0.16));
    }

    .paper {
      fill: rgba(255, 255, 255, 0.82);
      stroke: rgba(148, 163, 184, 0.3);
      stroke-width: 1;
    }
  `;
}
