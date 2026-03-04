// packages/core-image/src/implementations/Rectangle.ts

import { IRectangle } from "../interfaces/IRectangle.js"

export class Rectangle implements IRectangle {

  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly width: number,
    public readonly height: number
  ) {}

  get left(): number { return this.x }
  get top(): number { return this.y }

  get right(): number { return this.x + this.width }
  get bottom(): number { return this.y + this.height }

  contains(x: number, y: number): boolean {
    return (
      x >= this.left &&
      x < this.right &&
      y >= this.top &&
      y < this.bottom
    )
  }

  intersects(other: IRectangle): boolean {

    return !(
      other.left >= this.right ||
      other.right <= this.left ||
      other.top >= this.bottom ||
      other.bottom <= this.top
    )
  }

  intersection(other: IRectangle): Rectangle | null {

    const left = Math.max(this.left, other.left)
    const top = Math.max(this.top, other.top)
    const right = Math.min(this.right, other.right)
    const bottom = Math.min(this.bottom, other.bottom)

    if (right <= left || bottom <= top)
      return null

    return new Rectangle(
      left,
      top,
      right - left,
      bottom - top
    )
  }
}