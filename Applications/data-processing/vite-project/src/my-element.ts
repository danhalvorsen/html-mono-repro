import { LitElement, css, html, unsafeCSS } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import componentStyles from './bbox-viewer.css?inline'

export interface IBoundingBox {
  readonly id: string
  readonly minX: number
  readonly minY: number
  readonly maxX: number
  readonly maxY: number
  readonly width: number
  readonly height: number
  readonly label?: string
}

@customElement('bbox-viewer')
export class BboxViewer extends LitElement {
  private static readonly AXIS_MARGIN = 48
  private static readonly GRID_STEPS = 10

  @property({ type: Array })
  boxes: IBoundingBox[] = []

  @property({ type: Number })
  padding = 10

  @property({ type: String })
  stroke = 'steelblue'

  @property({ type: String })
  fill = 'rgba(70,130,180,0.15)'

  @property({ type: String })
  labelFont = '11px sans-serif'

  @query('canvas')
  private _canvas!: HTMLCanvasElement

  private get _bounds() {
    if (this.boxes.length === 0) return null
    const minX = Math.min(...this.boxes.map((b) => b.minX)) - this.padding
    const minY = Math.min(...this.boxes.map((b) => b.minY)) - this.padding
    const maxX = Math.max(...this.boxes.map((b) => b.maxX)) + this.padding
    const maxY = Math.max(...this.boxes.map((b) => b.maxY)) + this.padding
    return { minX, minY, width: maxX - minX, height: maxY - minY }
  }

  private get _canvasSize() {
    const bounds = this._bounds
    if (!bounds) return null

    return {
      width: Math.max(1, Math.ceil(bounds.width + BboxViewer.AXIS_MARGIN * 2)),
      height: Math.max(1, Math.ceil(bounds.height + BboxViewer.AXIS_MARGIN * 2)),
    }
  }

  render() {
    const canvasSize = this._canvasSize
    if (!canvasSize) return html`<p class="empty">No bounding boxes to display.</p>`
    return html`<canvas width=${canvasSize.width} height=${canvasSize.height}></canvas>`
  }

  updated() {
    this._draw()
  }

  private _draw() {
    const b = this._bounds
    if (!b || !this._canvas) return

    const ctx = this._canvas.getContext('2d')
    if (!ctx) return

    const axisMargin = BboxViewer.AXIS_MARGIN
    const plotWidth = this._canvas.width - axisMargin * 2
    const plotHeight = this._canvas.height - axisMargin * 2

    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height)
    this._drawCoordinateSystem(ctx, b, axisMargin, plotWidth, plotHeight)

    for (const box of this.boxes) {
      const x = axisMargin + (box.minX - b.minX)
      const y = axisMargin + (box.minY - b.minY)

      ctx.fillStyle = this.fill
      ctx.fillRect(x, y, box.width, box.height)

      ctx.strokeStyle = this.stroke
      ctx.lineWidth = 1
      ctx.strokeRect(x, y, box.width, box.height)

      if (box.label) {
        ctx.fillStyle = this.stroke
        ctx.font = this.labelFont
        ctx.fillText(box.label, x + 2, y + 12)
      }
    }
  }

  private _drawCoordinateSystem(
    ctx: CanvasRenderingContext2D,
    bounds: NonNullable<BboxViewer['_bounds']>,
    axisMargin: number,
    plotWidth: number,
    plotHeight: number,
  ) {
    const left = axisMargin
    const top = axisMargin
    const right = axisMargin + plotWidth
    const bottom = axisMargin + plotHeight
    const steps = BboxViewer.GRID_STEPS

    ctx.save()

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(left, top, plotWidth, plotHeight)

    ctx.strokeStyle = 'rgba(120, 120, 120, 0.2)'
    ctx.lineWidth = 1

    for (let index = 0; index <= steps; index += 1) {
      const x = left + (plotWidth / steps) * index
      const y = top + (plotHeight / steps) * index

      ctx.beginPath()
      ctx.moveTo(x, top)
      ctx.lineTo(x, bottom)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(left, y)
      ctx.lineTo(right, y)
      ctx.stroke()
    }

    ctx.strokeStyle = '#222222'
    ctx.lineWidth = 1.5

    ctx.beginPath()
    ctx.moveTo(left, top)
    ctx.lineTo(left, bottom)
    ctx.lineTo(right, bottom)
    ctx.stroke()

    ctx.fillStyle = '#222222'
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'

    for (let index = 0; index <= steps; index += 1) {
      const x = left + (plotWidth / steps) * index
      const value = bounds.minX + (bounds.width / steps) * index

      ctx.beginPath()
      ctx.moveTo(x, bottom)
      ctx.lineTo(x, bottom + 5)
      ctx.stroke()

      ctx.fillText(value.toFixed(0), x, bottom + 8)
    }

    ctx.save()
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'

    for (let index = 0; index <= steps; index += 1) {
      const y = top + (plotHeight / steps) * index
      const value = bounds.minY + (bounds.height / steps) * index

      ctx.beginPath()
      ctx.moveTo(left - 5, y)
      ctx.lineTo(left, y)
      ctx.stroke()

      ctx.fillText(value.toFixed(0), left - 8, y)
    }

    ctx.restore()

    ctx.fillStyle = '#222222'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('X', right + 18, bottom)

    ctx.save()
    ctx.translate(left, top - 18)
    ctx.fillText('Y', 0, 0)
    ctx.restore()

    ctx.restore()
  }

  static styles = css`${unsafeCSS(componentStyles)}`
}

declare global {
  interface HTMLElementTagNameMap {
    'bbox-viewer': BboxViewer
  }
}
