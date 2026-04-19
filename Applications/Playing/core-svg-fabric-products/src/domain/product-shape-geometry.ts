export interface CircleGeometry {
  readonly center: number;
  readonly radius: number;
  readonly size: number;
}

export interface BoxGeometry {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly sizeWidth: number;
  readonly sizeHeight: number;
}

export interface TriangleGeometry {
  readonly size: number;
  readonly points: string;
}

export interface BoxTriangleGeometry {
  readonly box: BoxGeometry;
  readonly triangle: TriangleGeometry;
  readonly width: number;
  readonly height: number;
  readonly boxOffsetY: number;
  readonly triangleOffsetX: number;
  readonly triangleOffsetY: number;
}

function normalizeAtLeast(value: number, minimum: number): number {
  return Number.isFinite(value) ? Math.max(minimum, value) : minimum;
}

export function createCircleGeometry(
  radius: number,
  strokeWidth: number,
): CircleGeometry {
  const normalizedRadius = normalizeAtLeast(radius, 2);
  const normalizedStrokeWidth = normalizeAtLeast(strokeWidth, 0);
  const size = normalizedRadius * 2 + normalizedStrokeWidth * 2;

  return {
    center: size / 2,
    radius: normalizedRadius,
    size,
  };
}

export function createBoxGeometry(
  width: number,
  height: number,
  strokeWidth: number,
): BoxGeometry {
  const normalizedStrokeWidth = normalizeAtLeast(strokeWidth, 0);
  const normalizedWidth = normalizeAtLeast(width, 2);
  const normalizedHeight = normalizeAtLeast(height, 2);

  return {
    x: normalizedStrokeWidth,
    y: normalizedStrokeWidth,
    width: normalizedWidth,
    height: normalizedHeight,
    sizeWidth: normalizedWidth + normalizedStrokeWidth * 2,
    sizeHeight: normalizedHeight + normalizedStrokeWidth * 2,
  };
}

export function createTriangleGeometry(
  side: number,
  strokeWidth: number,
): TriangleGeometry {
  const normalizedSide = normalizeAtLeast(side, 2);
  const normalizedStrokeWidth = normalizeAtLeast(strokeWidth, 0);
  const height = (Math.sqrt(3) / 2) * normalizedSide;
  const size = Math.max(normalizedSide, height) + normalizedStrokeWidth * 2;
  const offset = normalizedStrokeWidth;
  const topX = offset + normalizedSide / 2;
  const topY = offset;
  const rightX = offset + normalizedSide;
  const bottomY = offset + height;

  return {
    size,
    points: `${topX},${topY} ${rightX},${bottomY} ${offset},${bottomY}`,
  };
}

export function createBoxTriangleGeometry(
  boxWidth: number,
  boxHeight: number,
  triangleSide: number,
  gap: number,
  strokeWidth: number,
): BoxTriangleGeometry {
  const box = createBoxGeometry(boxWidth, boxHeight, strokeWidth);
  const triangle = createTriangleGeometry(triangleSide, strokeWidth);
  const normalizedGap = normalizeAtLeast(gap, 0);
  const height = Math.max(box.sizeHeight, triangle.size);

  return {
    box,
    triangle,
    width: box.sizeWidth + normalizedGap + triangle.size,
    height,
    boxOffsetY: (height - box.sizeHeight) / 2,
    triangleOffsetX: box.sizeWidth + normalizedGap,
    triangleOffsetY: (height - triangle.size) / 2,
  };
}
