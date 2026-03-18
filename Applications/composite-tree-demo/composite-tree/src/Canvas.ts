import { customElement, property } from 'lit/decorators.js'
import { ShapeCartesianCanvasElement, type ICartesianPoint } from './ShapeCartesianCanvasElement'

@customElement('shape-canvas')
export class Canvas extends ShapeCartesianCanvasElement {
  @property({ type: Number }) public x = 0
  @property({ type: Number }) public y = 0
  @property({ type: Number }) public width = 760
  @property({ type: Number }) public height = 520

  public override svgToScreen(point: Readonly<ICartesianPoint>): ICartesianPoint | null {
    return super.svgToScreen(point)
  }

  public override screenToSvg(point: Readonly<ICartesianPoint>): ICartesianPoint | null {
    return super.screenToSvg(point)
  }

  protected override willUpdate(): void {
    this.canvasWidth = this.width
    this.canvasHeight = this.height
  }

  protected override updated(): void {
    this.style.position = 'absolute'
    this.style.left = `${this.x}px`
    this.style.top = `${this.y}px`
    this.style.width = `${this.width}px`
    this.style.height = `${this.height}px`
  }
}
