import type { IStyleReference } from '@monorepo/core-style-system'
import type { DrawableShape } from './DrawableShape'
import type { ICoordinateSystemShape } from './ICoordinateSystemShape'
import type { IEllipseShape } from './IEllipseShape'
import type { IGridShape } from './IGridShape'
import type { ILineShape } from './ILineShape'
import type { IShapeGroup } from './IShapeGroup'

export type ShapeKind = 'group' | 'grid' | 'line' | 'polygon' | 'circle' | 'ellipse' | 'vertex'

export interface IPoint {
  readonly x: number
  readonly y: number
}

export interface IShape {
  readonly id: string
  readonly kind: ShapeKind
  readonly style?: Readonly<IStyleReference>
}

export interface IVertex extends IShape {
  readonly kind: 'vertex'
  readonly point: IPoint
  readonly marker: 'circle' | 'arrow'
  readonly size: number
  readonly rotation?: number
}

export interface IEdge {
  readonly id: string
  readonly from: IVertex
  readonly to: IVertex
  readonly style?: Readonly<IStyleReference>
}

export interface IPolygon extends IShape {
  readonly kind: 'polygon'
  readonly vertices: readonly IVertex[]
  readonly edges: readonly IEdge[]
  readonly closed: boolean
}

class ShapeIdGenerator {
  private next = 0

  public create(prefix: string): string {
    const id = `${prefix}-${this.next}`
    this.next += 1
    return id
  }
}

const ids = new ShapeIdGenerator()

const point = (x: number, y: number): IPoint => ({ x, y })

const withDefaultToken = (
  style: Readonly<IStyleReference> | undefined,
  token: string,
): Readonly<IStyleReference> => ({
  token: style?.token ?? token,
  ...(style?.overrides !== undefined ? { overrides: style.overrides } : {}),
})

export class VertexShape implements IVertex {
  public readonly id: string
  public readonly kind = 'vertex' as const
  public readonly style: Readonly<IStyleReference>

  public constructor(
    public readonly point: IPoint,
    public readonly marker: 'circle' | 'arrow' = 'circle',
    public readonly size = 8,
    public readonly rotation = 0,
    style?: Readonly<IStyleReference>,
    id?: string,
  ) {
    this.id = id ?? ids.create('vertex')
    this.style = withDefaultToken(style, 'vertex')
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
    this.id = id ?? ids.create('edge')
    this.style = withDefaultToken(style, 'line')
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
    this.id = id ?? ids.create('polygon')
    this.style = withDefaultToken(style, 'surface')
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

export interface ICircleShape extends IShape {
  readonly kind: 'circle'
  readonly center: IPoint
  readonly radius: number
}

export class CircleShape implements ICircleShape {
  public readonly id: string
  public readonly kind = 'circle' as const
  public readonly style: Readonly<IStyleReference>

  public constructor(
    public readonly center: IPoint,
    public readonly radius: number,
    style?: Readonly<IStyleReference>,
    id?: string,
  ) {
    this.id = id ?? ids.create('circle')
    this.style = withDefaultToken(style, 'circle-primary')
  }
}

export class EllipseShape implements IEllipseShape {
  public readonly id: string
  public readonly kind = 'ellipse' as const
  public readonly style: Readonly<IStyleReference>

  public constructor(
    public readonly center: IPoint,
    public readonly radiusX: number,
    public readonly radiusY: number,
    style?: Readonly<IStyleReference>,
    id?: string,
  ) {
    this.id = id ?? ids.create('ellipse')
    this.style = withDefaultToken(style, 'surface')
  }
}

export class LineShape implements ILineShape {
  public readonly id: string
  public readonly kind = 'line' as const
  public readonly style: Readonly<IStyleReference>

  public constructor(
    public readonly start: IPoint,
    public readonly end: IPoint,
    style?: Readonly<IStyleReference>,
    public readonly startVertex?: IVertex,
    public readonly endVertex?: IVertex,
    id?: string,
  ) {
    this.id = id ?? ids.create('line')
    this.style = withDefaultToken(style, 'line')
  }
}

export class GridShape implements IGridShape {
  public readonly id: string
  public readonly kind = 'grid' as const
  public readonly style: Readonly<IStyleReference>

  public constructor(
    public readonly width: number,
    public readonly height: number,
    public readonly spacing: number,
    public readonly majorEvery: number,
    style?: Readonly<IStyleReference>,
    id?: string,
  ) {
    this.id = id ?? ids.create('grid')
    this.style = withDefaultToken(style, 'grid')
  }
}

export class ShapeGroup implements IShapeGroup {
  public readonly id: string
  public readonly kind = 'group' as const
  public readonly style: Readonly<IStyleReference>

  public constructor(
    public readonly shapes: readonly DrawableShape[],
    style?: Readonly<IStyleReference>,
    id?: string,
  ) {
    this.id = id ?? ids.create('group')
    this.style = withDefaultToken(style, 'base')
  }
}

export class CoordinateSystemShape extends ShapeGroup implements ICoordinateSystemShape {
  public constructor(
    public readonly grid: IGridShape,
    public readonly xAxis: ILineShape,
    public readonly yAxis: ILineShape,
    id?: string,
  ) {
    super([grid, xAxis, yAxis], { token: 'base' }, id)
  }
}

export const createCircleVertex = (
  x: number,
  y: number,
  size = 6,
  style?: Readonly<IStyleReference>,
): IVertex => new VertexShape(point(x, y), 'circle', size, 0, style)

export const createArrowVertex = (
  x: number,
  y: number,
  rotation: number,
  size = 12,
  style?: Readonly<IStyleReference>,
): IVertex => new VertexShape(point(x, y), 'arrow', size, rotation, style)

export const createTriangle = (
  center: IPoint,
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
  center: IPoint,
  width: number,
  height: number,
  style?: Readonly<IStyleReference>,
): IPolygon => {
  const halfWidth = width / 2
  const halfHeight = height / 2

  return new PolygonShape(
    [
      createCircleVertex(center.x - halfWidth, center.y - halfHeight),
      createCircleVertex(center.x + halfWidth, center.y - halfHeight),
      createCircleVertex(center.x + halfWidth, center.y + halfHeight),
      createCircleVertex(center.x - halfWidth, center.y + halfHeight),
    ],
    true,
    style,
  )
}

export const createSquare = (
  center: IPoint,
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

  const grid = new GridShape(width, height, spacing, 5, {
    token: 'grid',
    overrides: { opacity: 0.85 },
  })

  const xAxis = new LineShape(
    point(-halfWidth, 0),
    point(halfWidth, 0),
    { token: 'axis-x' },
    createArrowVertex(-halfWidth, 0, 180, 12, {
      token: 'vertex',
      overrides: { stroke: { color: '#b91c1c' }, fill: { color: '#b91c1c' } },
    }),
    createArrowVertex(halfWidth, 0, 0, 12, {
      token: 'vertex',
      overrides: { stroke: { color: '#b91c1c' }, fill: { color: '#b91c1c' } },
    }),
  )

  const yAxis = new LineShape(
    point(0, -halfHeight),
    point(0, halfHeight),
    { token: 'axis-y' },
    createArrowVertex(0, -halfHeight, -90, 12, {
      token: 'vertex',
      overrides: { stroke: { color: '#1d4ed8' }, fill: { color: '#1d4ed8' } },
    }),
    createArrowVertex(0, halfHeight, 90, 12, {
      token: 'vertex',
      overrides: { stroke: { color: '#1d4ed8' }, fill: { color: '#1d4ed8' } },
    }),
  )

  return new CoordinateSystemShape(grid, xAxis, yAxis)
}

export const createDemoScene = (): readonly DrawableShape[] => {
  const coordinateSystem = createCoordinateSystem(760, 520, 28)

  const line = new LineShape(
    point(-280, -130),
    point(-120, 40),
    { token: 'line' },
    createCircleVertex(-280, -130, 5, {
      token: 'vertex',
      overrides: { fill: { color: '#2563eb' }, stroke: { color: '#2563eb' } },
    }),
    createArrowVertex(-120, 40, 48, 11, {
      token: 'vertex',
      overrides: { fill: { color: '#2563eb' }, stroke: { color: '#2563eb' } },
    }),
  )

  return [
    coordinateSystem,
    line,
    new CircleShape(point(-220, 130), 52, { token: 'circle-primary' }),
    createTriangle(point(-40, 150), 110, {
      token: 'surface',
      overrides: {
        stroke: { color: '#7c3aed', width: 3 },
        fill: { color: 'rgba(124, 58, 237, 0.18)' },
      },
    }),
    createSquare(point(150, 120), 96, {
      token: 'surface',
      overrides: {
        stroke: { color: '#ea580c', width: 3 },
        fill: { color: 'rgba(234, 88, 12, 0.16)' },
      },
    }),
    createRectangle(point(265, -55), 150, 84, {
      token: 'surface',
      overrides: {
        stroke: { color: '#b91c1c', width: 3 },
        fill: { color: 'rgba(185, 28, 28, 0.15)' },
      },
    }),
    new EllipseShape(point(-40, -95), 84, 48, {
      token: 'surface',
      overrides: {
        stroke: { color: '#0891b2', width: 3 },
        fill: { color: 'rgba(8, 145, 178, 0.15)' },
      },
    }),
  ]
}
