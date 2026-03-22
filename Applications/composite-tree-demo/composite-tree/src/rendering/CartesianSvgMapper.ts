import type { Point } from '@monorepo/core-math'

export class CartesianSvgMapper {
  public constructor(
    private readonly canvasWidth: number,
    private readonly canvasHeight: number,
  ) {}

  public svgToScreen(point: Readonly<Point>, rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>): Point {
    const normalizedX = (point.x + this.canvasWidth / 2) / this.canvasWidth
    const normalizedY = (this.canvasHeight / 2 - point.y) / this.canvasHeight

    return {
      x: rect.left + normalizedX * rect.width,
      y: rect.top + normalizedY * rect.height,
    }
  }

  public screenToSvg(point: Readonly<Point>, rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>): Point {
    const normalizedX = (point.x - rect.left) / rect.width
    const normalizedY = (point.y - rect.top) / rect.height

    return {
      x: normalizedX * this.canvasWidth - this.canvasWidth / 2,
      y: this.canvasHeight / 2 - normalizedY * this.canvasHeight,
    }
  }
}
