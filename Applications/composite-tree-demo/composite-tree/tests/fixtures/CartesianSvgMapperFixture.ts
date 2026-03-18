export class CartesianSvgMapperFixture {
  public readonly left = 100
  public readonly top = 40
  public readonly width = 400
  public readonly height = 300
  public readonly canvasWidth = 200
  public readonly canvasHeight = 150

  public createRect(): DOMRect {
    return {
      left: this.left,
      top: this.top,
      width: this.width,
      height: this.height,
      right: this.left + this.width,
      bottom: this.top + this.height,
      x: this.left,
      y: this.top,
      toJSON: () => ({}),
    } as DOMRect
  }
}
