export class Viewport {
  readonly width: number
  readonly height: number

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
  }

  get halfWidth(): number {
    return this.width / 2
  }

  get halfHeight(): number {
    return this.height / 2
  }

  toData(): { width: number; height: number } {
    return { width: this.width, height: this.height }
  }
}
