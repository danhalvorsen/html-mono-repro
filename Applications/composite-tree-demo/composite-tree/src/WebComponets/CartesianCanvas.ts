import { html, type TemplateResult } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { AbstractSvgSceneCanvasElement } from '../Shapes/Canvas/CartesianSvgCanvasElement'
import type { DrawableShape } from '../DrawableShape'
import { AbstractDrawableElement } from '../ShapeElement'
import { CartesianSvgMapper } from '../rendering/CartesianSvgMapper'

export interface ICartesianPoint {
  readonly x: number
  readonly y: number
}

@customElement('cartesian-canvas')
export class CartesianCanvas extends AbstractSvgSceneCanvasElement {
  @property({ type: Number }) public x = 0
  @property({ type: Number }) public y = 0
  @property({ type: Number }) public width = 760
  @property({ type: Number }) public height = 520

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

    return this.createMapper().svgToScreen(point, svg.getBoundingClientRect())
  }

  public screenToSvg(point: Readonly<ICartesianPoint>): ICartesianPoint | null {
    const svg = this.shadowRoot?.querySelector('svg.canvas')
    if (!(svg instanceof SVGSVGElement)) {
      return null
    }

    return this.createMapper().screenToSvg(point, svg.getBoundingClientRect())
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

  private _onSlotChange = (e: Event): void => {
    const slot = e.target as HTMLSlotElement
    this.shapes = slot
      .assignedElements()
      .filter((el): el is AbstractDrawableElement => el instanceof AbstractDrawableElement)
      .map(el => el.toShape())
  }

  private _onShapeChanged = (): void => {
    const slot = this.shadowRoot?.querySelector('slot')
    if (!slot) return
    this.shapes = slot
      .assignedElements()
      .filter((el): el is AbstractDrawableElement => el instanceof AbstractDrawableElement)
      .map(el => el.toShape())
  }

  private createMapper(): CartesianSvgMapper {
    return new CartesianSvgMapper(this.canvasWidth, this.canvasHeight)
  }
}
