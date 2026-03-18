import type { IStyleReference } from '@monorepo/core-style-system'

import type { ICoordinateSystemShape } from './Shapes/CoordinateSystem/ICoordinateSystemShape'
import type { Point } from '@monorepo/core-math'
import { LineShape } from './Shapes/Line/LineShape'
import { GridShape } from './Shapes/Grid/GridShape'
import { CoordinateSystemShape } from './Shapes/CoordinateSystem/CoordinateSystemShape'
import type { IVertex } from './Shapes/Vertex/IVertex'
import type { IEdge } from './Shapes/Edge/IEdge'
import type { IPolygon } from './Shapes/Polygon/IPolygon'
import type { IShape } from './Shape/IShape'
import { AxisShape } from './Shapes/CoordinateSystem/Axis/AxisShape'
 
export type ShapeKind = 'group' | 'grid' | 'line' | 'polygon' | 'circle' | 'ellipse' | 'vertex' | 'axis'

class ShapeIdService {
  private next = 0

  public create(prefix: string): string {
    const id = `${prefix}-${this.next}`
    this.next += 1
    return id
  }
}

class StyleReferenceService {
  public withDefault(
    style: Readonly<IStyleReference> | undefined,
    token: string,
  ): Readonly<IStyleReference> {
    return {
      token: style?.token ?? token,
      ...(style?.overrides !== undefined ? { overrides: style.overrides } : {}),
    }
  }
}

class PointFactory {
  public from(x: number, y: number): Point {
    return { x, y }
  }
}

export const ShapeIds = new ShapeIdService()
export const StyleReferences = new StyleReferenceService()
export const Points = new PointFactory()

export class VertexShape implements IVertex {
  public readonly id: string
  public readonly kind = 'vertex' as const
  public readonly style: Readonly<IStyleReference>

  public constructor(
    public readonly point: Point,
    public readonly marker: 'circle' | 'arrow' = 'circle',
    public readonly size = 8,
    public readonly rotation = 0,
    style?: Readonly<IStyleReference>,
    id?: string,
  ) {
    this.id = id ?? ShapeIds.create('vertex')
    this.style = StyleReferences.withDefault(style, 'vertex')
  }
}

export class Edge implements IEdge {
  public readonly id: string
  public readonly style: Readonly<IStyleReference>

  public constructor(
    public readonly from: IVertex,
    public readonly to: IVertex,
    style?: Readonly<IStyleReference>,
    id?: string,
  ) {
    this.id = id ?? ShapeIds.create('edge')
    this.style = StyleReferences.withDefault(style, 'line')
  }
}

export class PolygonShape implements IPolygon {
  public readonly id: string
  public readonly kind = 'polygon' as const
  public readonly style: Readonly<IStyleReference>
  public readonly edges: readonly IEdge[]

  public constructor(
    public readonly vertices: readonly IVertex[],
    public readonly closed = true,
    style?: Readonly<IStyleReference>,
    id?: string,
  ) {
    this.id = id ?? ShapeIds.create('polygon')
    this.style = StyleReferences.withDefault(style, 'surface')
    this.edges = PolygonShape.createEdges(vertices, closed, this.style)
  }

  private static createEdges(
    vertices: readonly IVertex[],
    closed: boolean,
    style: Readonly<IStyleReference>,
  ): readonly IEdge[] {
    if (vertices.length < 2) {
      return []
    }

    const edges: IEdge[] = []

    for (let index = 0; index < vertices.length - 1; index += 1) {
      const from = vertices[index]
      const to = vertices[index + 1]

      if (from !== undefined && to !== undefined) {
        edges.push(new Edge(from, to, style))
      }
    }

    if (closed) {
      const last = vertices[vertices.length - 1]
      const first = vertices[0]

      if (last !== undefined && first !== undefined) {
        edges.push(new Edge(last, first, style))
      }
    }

    return edges
  }
}

export class RectangleShape extends PolygonShape {
  public constructor(
    public readonly center: Point,
    public readonly width: number,
    public readonly height: number,
    style?: Readonly<IStyleReference>,
    id?: string,
  ) {
    const halfWidth = width / 2
    const halfHeight = height / 2

    super(
      [
        new VertexShape(Points.from(center.x - halfWidth, center.y - halfHeight)),
        new VertexShape(Points.from(center.x + halfWidth, center.y - halfHeight)),
        new VertexShape(Points.from(center.x + halfWidth, center.y + halfHeight)),
        new VertexShape(Points.from(center.x - halfWidth, center.y + halfHeight)),
      ],
      true,
      StyleReferences.withDefault(style, 'rectangle'),
      id,
    )
  }
}

export interface ICircleShape extends IShape {
  readonly kind: 'circle'
  readonly center: Point
  readonly radius: number
}

export class CircleShape implements ICircleShape {
  public readonly id: string
  public readonly kind = 'circle' as const
  public readonly style: Readonly<IStyleReference>

  public constructor(
    public readonly center: Point,
    public readonly radius: number,
    style?: Readonly<IStyleReference>,
    id?: string,
  ) {
    this.id = id ?? ShapeIds.create('circle')
    this.style = StyleReferences.withDefault(style, 'circle-primary')
  }
}

export const createCircleVertex = (
  x: number,
  y: number,
  size = 6,
  style?: Readonly<IStyleReference>,
): IVertex => new VertexShape(Points.from(x, y), 'circle', size, 0, style)

export const createArrowVertex = (
  x: number,
  y: number,
  rotation: number,
  size = 12,
  style?: Readonly<IStyleReference>,
): IVertex => new VertexShape(Points.from(x, y), 'arrow', size, rotation, style)

export const createTriangle = (
  center: Point,
  side: number,
  style?: Readonly<IStyleReference>,
): IPolygon => {
  const height = (Math.sqrt(3) * side) / 2
  const halfSide = side / 2

  return new PolygonShape(
    [
      createCircleVertex(center.x, center.y + (2 * height) / 3),
      createCircleVertex(center.x - halfSide, center.y - height / 3),
      createCircleVertex(center.x + halfSide, center.y - height / 3),
    ],
    true,
    style,
  )
}

export const createRectangle = (
  center: Point,
  width: number,
  height: number,
  style?: Readonly<IStyleReference>,
): IPolygon => new RectangleShape(center, width, height, style)

export const createSquare = (
  center: Point,
  size: number,
  style?: Readonly<IStyleReference>,
): IPolygon => createRectangle(center, size, size, style)

export const createCoordinateSystem = (
  width: number,
  height: number,
  spacing: number,
): ICoordinateSystemShape => {
  const halfWidth = width / 2
  const halfHeight = height / 2
  const axisMarkerSize = 12
  const axisInset = axisMarkerSize + 2
  const xMin = -halfWidth + axisInset
  const xMax = halfWidth - axisInset
  const yMin = -halfHeight + axisInset
  const yMax = halfHeight - axisInset

  const grid = new GridShape(width, height, spacing, 5, {
    token: 'grid',
    overrides: { opacity: 0.85 },
  })

  const xAxisLine = new LineShape(
    Points.from(xMin, 0),
    Points.from(xMax, 0),
    { token: 'line' },
    createArrowVertex(xMin, 0, 180, axisMarkerSize, { token: 'vertex' }),
    createArrowVertex(xMax, 0, 0, axisMarkerSize, { token: 'vertex' }),
  )
  const xAxis = new AxisShape('x', xAxisLine, { token: 'axis-x' })

  const yAxisLine = new LineShape(
    Points.from(0, yMin),
    Points.from(0, yMax),
    { token: 'line' },
    createArrowVertex(0, yMin, -90, axisMarkerSize, { token: 'vertex' }),
    createArrowVertex(0, yMax, 90, axisMarkerSize, { token: 'vertex' }),
  )
  const yAxis = new AxisShape('y', yAxisLine, { token: 'axis-y' })

  return new CoordinateSystemShape(grid, xAxis, yAxis)
}
