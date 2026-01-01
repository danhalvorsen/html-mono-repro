import type { LineStyle } from './LineStyle'
import type { ThreeCanvasOptions } from './ThreeCanvasOptions'
import type { Point2 } from '@monorepo/core-math'
import { Application } from './Application'

export class ThreeCanvas {
  readonly canvas: HTMLCanvasElement
  readonly application: Application

  #resizeObserver: ResizeObserver
  #ownsApplication = false

  constructor({ canvas, application, ...applicationOptions }: ThreeCanvasOptions) {
    this.canvas = canvas
    this.application = application ?? new Application({ canvas, ...applicationOptions })
    this.#ownsApplication = application === undefined

    this.#resizeObserver = new ResizeObserver(() => this.resizeToCanvas())
    this.#resizeObserver.observe(this.canvas)

    this.resizeToCanvas()
  }

  resizeToCanvas() {
    const width = Math.max(1, Math.floor(this.canvas.clientWidth))
    const height = Math.max(1, Math.floor(this.canvas.clientHeight))
    this.application.resize(width, height)
  }

  render() {
    this.application.render()
  }

  clear() {
    this.application.clear()
  }

  drawLine(a: Point2, b: Point2, style: LineStyle = {}) {
    return this.application.drawLine(a, b, style)
  }

  dispose() {
    this.#resizeObserver.disconnect()
    this.clear()
    if (this.#ownsApplication) this.application.dispose()
  }
}
