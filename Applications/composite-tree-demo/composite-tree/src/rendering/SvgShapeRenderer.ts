import { type SVGTemplateResult, svg } from 'lit'
import type { Point } from '@monorepo/core-math'
import type { IStyle, IStyleReference, IStyleResolver } from '@monorepo/core-style-system'

import type { DrawableShape } from '../DrawableShape'
import type { ICircleShape } from '../Shapes/shape-model'
import type { IEllipseShape } from '../Shapes/Circle/IEllipseShape'
import type { IGridShape } from '../Shapes/Grid/IGridShape'
import type { IShapeGroup } from '../Shapes/Group/IShapeGroup'
import type { ILineShape } from '../Shapes/Line/ILineShape'
import type { IPolygon } from '../Shapes/Polygon/IPolygon'
import type { IVertex } from '../Shapes/Vertex/IVertex'
import type { ICoordinateSystemShape } from '../Shapes/CoordinateSystem/ICoordinateSystemShape'
import type { IAxis } from '../Shapes/CoordinateSystem/Axis/IAxis'
import { ShapeStylePolicy } from './ShapeStylePolicy'
import { SvgStyleAdapter, type ISvgStyle } from './SvgStyleAdapter'

export class SvgShapeRenderer {
  public constructor(
    private readonly styleResolver: IStyleResolver,
    private readonly styleAdapter: SvgStyleAdapter,
    private readonly stylePolicy: ShapeStylePolicy,
  ) {}

  public renderShape(shape: DrawableShape): SVGTemplateResult {
    switch (shape.kind) {
      case 'group':
        return this.renderGroup(shape)
      case 'grid':
        return this.renderGrid(shape)
      case 'line':
        return this.renderLine(shape)
      case 'axis':
        return this.renderAxis(shape)
      case 'polygon':
        return this.renderPolygon(shape)
      case 'circle':
        return this.renderCircle(shape)
      case 'ellipse':
        return this.renderEllipse(shape)
      case 'vertex':
        return this.renderVertex(shape)
      default: {
        const unhandled: never = shape as never
        throw new Error(`Unsupported shape kind: ${(unhandled as { kind?: string }).kind ?? 'unknown'}`)
      }
    }
  }

  private resolveStyle(reference?: Readonly<IStyleReference>): ISvgStyle {
    return this.styleAdapter.adapt(this.styleResolver.resolve(reference))
  }

  private resolveStyleWithPolicy(
    reference: Readonly<IStyleReference> | undefined,
    lineStyle: Readonly<IStyle> | undefined,
  ): ISvgStyle {
    if (lineStyle === undefined) {
      return this.resolveStyle(reference)
    }

    return this.resolveStyle(this.stylePolicy.lineEndpointReference(reference, lineStyle))
  }

  private renderGroup(shape: IShapeGroup | ICoordinateSystemShape): SVGTemplateResult {
    if (this.isCoordinateSystemShape(shape)) {
      const originStyle = this.resolveStyle({ token: 'vertex' })

      return svg`
        <g data-shape-id=${shape.id}>
          ${shape.shapes.map((child) => this.renderShape(child))}
          <circle
            cx="0"
            cy="0"
            r="4.5"
            stroke=${originStyle.stroke}
            fill=${originStyle.fill}
            stroke-width=${originStyle.strokeWidth}
            opacity=${originStyle.opacity}
          ></circle>
        </g>`
    }

    return svg`<g data-shape-id=${shape.id}>${shape.shapes.map((child) => this.renderShape(child))}</g>`
  }

  private isCoordinateSystemShape(shape: IShapeGroup | ICoordinateSystemShape): shape is ICoordinateSystemShape {
    return 'grid' in shape && 'xAxis' in shape && 'yAxis' in shape
  }

  private renderGrid(shape: IGridShape): SVGTemplateResult {
    const halfWidth = shape.width / 2
    const halfHeight = shape.height / 2
    const lines: SVGTemplateResult[] = []
    const gridStyle = this.resolveStyle(shape.style)
    const majorLineWidth = Math.max(gridStyle.strokeWidth, 1.2)
    const minorLineWidth = Math.max(0.5, majorLineWidth * 0.55)

    for (let x = -halfWidth; x <= halfWidth; x += shape.spacing) {
      if (x === 0) {
        continue
      }

      const isMajor = Math.round(Math.abs(x) / shape.spacing) % shape.majorEvery === 0
      lines.push(svg`<line
        x1=${x}
        y1=${-halfHeight}
        x2=${x}
        y2=${halfHeight}
        stroke=${gridStyle.stroke}
        stroke-width=${isMajor ? majorLineWidth : minorLineWidth}
        stroke-dasharray=""
        opacity=${isMajor ? 0.85 : gridStyle.opacity}
      ></line>`)
    }

    for (let y = -halfHeight; y <= halfHeight; y += shape.spacing) {
      if (y === 0) {
        continue
      }

      const isMajor = Math.round(Math.abs(y) / shape.spacing) % shape.majorEvery === 0
      lines.push(svg`<line
        x1=${-halfWidth}
        y1=${y}
        x2=${halfWidth}
        y2=${y}
        stroke=${gridStyle.stroke}
        stroke-width=${isMajor ? majorLineWidth : minorLineWidth}
        stroke-dasharray=""
        opacity=${isMajor ? 0.85 : gridStyle.opacity}
      ></line>`)
    }

    return svg`<g data-shape-id=${shape.id} shape-rendering="crispEdges">${lines}</g>`
  }

  private renderLine(shape: ILineShape): SVGTemplateResult {
    const lineResolvedStyle = this.styleResolver.resolve(shape.style)
    const lineStyle = this.styleAdapter.adapt(lineResolvedStyle)
    const startVertexStyle = shape.startVertex !== undefined
      ? this.resolveStyleWithPolicy(shape.startVertex.style, lineResolvedStyle)
      : undefined
    const endVertexStyle = shape.endVertex !== undefined
      ? this.resolveStyleWithPolicy(shape.endVertex.style, lineResolvedStyle)
      : undefined

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
        ${shape.startVertex ? this.renderVertex(shape.startVertex, startVertexStyle) : svg``}
        ${shape.endVertex ? this.renderVertex(shape.endVertex, endVertexStyle) : svg``}
      </g>
    `
  }

  private renderAxis(axis: IAxis): SVGTemplateResult {
    const axisResolvedStyle = this.styleResolver.resolve(axis.style)
    const axisStyle = this.styleAdapter.adapt(axisResolvedStyle)
    const startVertexStyle = axis.line.startVertex !== undefined
      ? this.resolveStyleWithPolicy(axis.line.startVertex.style, axisResolvedStyle)
      : undefined
    const endVertexStyle = axis.line.endVertex !== undefined
      ? this.resolveStyleWithPolicy(axis.line.endVertex.style, axisResolvedStyle)
      : undefined

    return svg`
      <g data-shape-id=${axis.id} data-axis-name=${axis.name}>
        <line
          x1=${axis.line.start.x}
          y1=${axis.line.start.y}
          x2=${axis.line.end.x}
          y2=${axis.line.end.y}
          stroke=${axisStyle.stroke}
          stroke-width=${axisStyle.strokeWidth}
          stroke-dasharray=${axisStyle.strokeDasharray}
          opacity=${axisStyle.opacity}
        ></line>
        ${axis.line.startVertex ? this.renderVertex(axis.line.startVertex, startVertexStyle) : svg``}
        ${axis.line.endVertex ? this.renderVertex(axis.line.endVertex, endVertexStyle) : svg``}
      </g>
    `
  }

  private renderPolygon(shape: IPolygon): SVGTemplateResult {
    const points = shape.vertices.map((vertex) => `${vertex.point.x},${vertex.point.y}`).join(' ')
    const polygonStyle = this.resolveStyle(shape.style)

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
    `
  }

  private renderCircle(shape: ICircleShape): SVGTemplateResult {
    const circleStyle = this.resolveStyle(shape.style)

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
    ></circle>`
  }

  private renderEllipse(shape: IEllipseShape): SVGTemplateResult {
    const ellipseStyle = this.resolveStyle(shape.style)

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
    ></ellipse>`
  }

  private renderVertex(shape: IVertex, preResolvedStyle?: Readonly<ISvgStyle>): SVGTemplateResult {
    const vertexStyle = preResolvedStyle ?? this.resolveStyle(shape.style)

    if (shape.marker === 'arrow') {
      const arrowPoints = this.arrowPoints(shape.point, shape.size, shape.rotation ?? 0)

      return svg`<polygon
        data-shape-id=${shape.id}
        points=${arrowPoints}
        stroke=${vertexStyle.stroke}
        fill=${vertexStyle.fill}
        stroke-width=${vertexStyle.strokeWidth}
        opacity=${vertexStyle.opacity}
      ></polygon>`
    }

    return svg`<circle
      data-shape-id=${shape.id}
      cx=${shape.point.x}
      cy=${shape.point.y}
      r=${shape.size}
      stroke=${vertexStyle.stroke}
      fill=${vertexStyle.fill}
      stroke-width=${vertexStyle.strokeWidth}
      opacity=${vertexStyle.opacity}
    ></circle>`
  }

  private arrowPoints(center: Point, size: number, rotationDegrees: number): string {
    const base = [
      { x: size, y: 0 },
      { x: -size * 0.55, y: size * 0.48 },
      { x: -size * 0.2, y: 0 },
      { x: -size * 0.55, y: -size * 0.48 },
    ]
    const radians = (rotationDegrees * Math.PI) / 180
    const cosine = Math.cos(radians)
    const sine = Math.sin(radians)

    return base
      .map((vertex) => {
        const x = center.x + vertex.x * cosine - vertex.y * sine
        const y = center.y + vertex.x * sine + vertex.y * cosine
        return `${x},${y}`
      })
      .join(' ')
  }
}
