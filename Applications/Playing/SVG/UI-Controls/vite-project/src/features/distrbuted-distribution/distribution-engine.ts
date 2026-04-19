import type { DistributionInput } from '../../domain/distribution.js'
import type { Placement, Point, Segment } from '../../domain/geometry.js'

export function parsePointsInput(pointsInput: string): ReadonlyArray<Point> {
  const chunks = pointsInput
    .trim()
    .split(/\s+/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0)

  const points: Point[] = []
  for (const chunk of chunks) {
    const [xText, yText] = chunk.split(',')
    const x = Number(xText)
    const y = Number(yText)
    if (Number.isFinite(x) && Number.isFinite(y)) {
      points.push({ x, y })
    }
  }
  return points
}

export function buildPolylinePath(points: ReadonlyArray<Point>, closed: boolean): string {
  if (points.length === 0) {
    return ''
  }

  const [first, ...rest] = points
  const commands = [`M ${first.x} ${first.y}`]
  for (const point of rest) {
    commands.push(`L ${point.x} ${point.y}`)
  }
  if (closed && points.length > 2) {
    commands.push('Z')
  }
  return commands.join(' ')
}

export function computePlacements(input: DistributionInput): ReadonlyArray<Placement> {
  const shapeCount = Math.max(0, Math.floor(input.shapeCount))
  if (shapeCount === 0 || input.points.length < 2) {
    return []
  }

  const segments = buildSegments(input.points, input.closed)
  if (segments.length === 0) {
    return []
  }

  const totalLength = segments[segments.length - 1]!.endDistance
  const startOffset = clamp(input.startOffset, 0, totalLength)
  const endOffset = clamp(input.endOffset, 0, totalLength)
  const usableLength = totalLength - startOffset - endOffset
  if (usableLength <= 0) {
    return []
  }

  const distances = computeSampleDistances(
    shapeCount,
    input.closed,
    startOffset,
    usableLength,
  )

  return distances.map((distance) => sampleAtDistance(segments, clamp(distance, 0, totalLength)))
}

function buildSegments(points: ReadonlyArray<Point>, closed: boolean): ReadonlyArray<Segment> {
  const segments: Segment[] = []
  let total = 0
  const count = points.length
  const maxIndex = closed ? count : count - 1

  for (let i = 0; i < maxIndex; i += 1) {
    const start = points[i]!
    const end = points[(i + 1) % count]!
    const dx = end.x - start.x
    const dy = end.y - start.y
    const length = Math.hypot(dx, dy)
    if (length <= 0) {
      continue
    }
    const startDistance = total
    total += length
    segments.push({
      start,
      end,
      length,
      startDistance,
      endDistance: total,
    })
  }

  return segments
}

function computeSampleDistances(
  shapeCount: number,
  closed: boolean,
  startOffset: number,
  usableLength: number,
): number[] {
  if (closed) {
    const step = usableLength / shapeCount
    const values: number[] = []
    for (let i = 0; i < shapeCount; i += 1) {
      values.push(startOffset + step * i)
    }
    return values
  }

  if (shapeCount === 1) {
    return [startOffset + usableLength * 0.5]
  }

  const step = usableLength / (shapeCount - 1)
  const values: number[] = []
  for (let i = 0; i < shapeCount; i += 1) {
    values.push(startOffset + step * i)
  }
  return values
}

function sampleAtDistance(
  segments: ReadonlyArray<Segment>,
  distance: number,
): Placement {
  for (const segment of segments) {
    if (distance > segment.endDistance) {
      continue
    }

    const local = distance - segment.startDistance
    const t = segment.length === 0 ? 0 : local / segment.length
    const x = segment.start.x + (segment.end.x - segment.start.x) * t
    const y = segment.start.y + (segment.end.y - segment.start.y) * t
    const angleDeg =
      (Math.atan2(segment.end.y - segment.start.y, segment.end.x - segment.start.x) * 180) /
      Math.PI

    return { x, y, angleDeg, distance }
  }

  const fallback = segments[segments.length - 1]!
  return {
    x: fallback.end.x,
    y: fallback.end.y,
    angleDeg:
      (Math.atan2(fallback.end.y - fallback.start.y, fallback.end.x - fallback.start.x) * 180) /
      Math.PI,
    distance,
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
