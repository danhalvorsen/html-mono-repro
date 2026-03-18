import { html, type TemplateResult } from 'lit'
import { customElement } from 'lit/decorators.js'
import { CartesianSvgCanvasElement } from './CartesianSvgCanvasElement'
import type { DrawableShape } from './DrawableShape'
import { ShapeElement } from './ShapeElement'

export interface ICartesianPoint {
  readonly x: number
  readonly y: number
}

@customElement('shape-cartesian-canvas')
export class ShapeCartesianCanvasElement extends CartesianSvgCanvasElement {
  protected renderScene(): readonly DrawableShape[] {
    return this.shapes
  }

  protected override render(): TemplateResult {
    return html`
      <div style="display:none">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
      ${super.render()}
    `
  }

  override connectedCallback(): void {
    super.connectedCallback()
    this.addEventListener('shape-changed', this._onShapeChanged)
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this.removeEventListener('shape-changed', this._onShapeChanged)
  }

  public svgToScreen(point: Readonly<ICartesianPoint>): ICartesianPoint | null {
    const svg = this.shadowRoot?.querySelector('svg.canvas')
    if (!(svg instanceof SVGSVGElement)) {
      return null
    }

    const rect = svg.getBoundingClientRect()
    const normalizedX = (point.x + this.canvasWidth / 2) / this.canvasWidth
    const normalizedY = (this.canvasHeight / 2 - point.y) / this.canvasHeight

    return {
      x: rect.left + normalizedX * rect.width,
      y: rect.top + normalizedY * rect.height,
    }
  }

  public screenToSvg(point: Readonly<ICartesianPoint>): ICartesianPoint | null {
    const svg = this.shadowRoot?.querySelector('svg.canvas')
    if (!(svg instanceof SVGSVGElement)) {
      return null
    }

    const rect = svg.getBoundingClientRect()
    const normalizedX = (point.x - rect.left) / rect.width
    const normalizedY = (point.y - rect.top) / rect.height

    return {
      x: normalizedX * this.canvasWidth - this.canvasWidth / 2,
      y: this.canvasHeight / 2 - normalizedY * this.canvasHeight,
    }
  }

  private _onSlotChange = (e: Event): void => {
    const slot = e.target as HTMLSlotElement
    this.shapes = slot
      .assignedElements()
      .filter((el): el is ShapeElement => el instanceof ShapeElement)
      .map(el => el.toShape())
  }

  private _onShapeChanged = (): void => {
    const slot = this.shadowRoot?.querySelector('slot')
    if (!slot) return
    this.shapes = slot
      .assignedElements()
      .filter((el): el is ShapeElement => el instanceof ShapeElement)
      .map(el => el.toShape())
  }
}
