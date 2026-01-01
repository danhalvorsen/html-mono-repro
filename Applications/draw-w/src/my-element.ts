import { LitElement, css, html } from 'lit'
import { customElement, query, state } from 'lit/decorators.js'
import { Turtle } from '@monorepo/core-composition-svg-turtle'
import type { Point2 } from '@monorepo/core-math'
import { ThreeCanvas } from './ThreeCanvas'
import { GraphicalCoordinateSystem } from './coordindate-system/GraphicalCoordinateSystem'
import { Viewport } from './coordindate-system/types/Viewport'
import './PointView.ts'

@customElement('my-element')
export class MyElement extends LitElement {
  @query('#viewport') private viewport?: HTMLCanvasElement
  @state() private points: Point2[] = [
    { x: -120, y: -60 },
    { x: 80, y: -10 },
    { x: 20, y: 120 },
  ]
  @state() private behavior: 'absolute' | 'turtle-centered' = 'absolute'

  #three: ThreeCanvas | undefined
  #coords: GraphicalCoordinateSystem | undefined

  render() {
    return html`
      <div class="layout">
        <aside class="left" part="ui">
          <my-point-view
            .points=${this.points}
            .behavior=${this.behavior}
            @redraw=${() => this.redraw()}
            @clear=${() => this.clear()}
            @add-point=${() => this.addPoint()}
            @remove-point=${(e: CustomEvent<{ index: number }>) => this.removePoint(e.detail.index)}
            @point-change=${(e: CustomEvent<{ index: number; key: 'x' | 'y'; value: number }>) =>
              this.onPointChange(e)}
            @behavior-change=${(e: CustomEvent<{ behavior: 'absolute' | 'turtle-centered' }>) =>
              this.onBehaviorChange(e)}
          ></my-point-view>
        </aside>

        <section class="right" part="renderer">
          <canvas id="viewport"></canvas>
        </section>
      </div>
    `
  }

  protected firstUpdated(): void {
    const canvas = this.viewport
    if (!canvas) return

    const three = new ThreeCanvas({ canvas, clearColor: 0x0b1020 })
    this.#three = three
    three.application.start()

    this.#coords = new GraphicalCoordinateSystem(this.getViewportSize())
    this.redraw()
  }

  disconnectedCallback(): void {
    super.disconnectedCallback()
    this.#three?.dispose()
    this.#three = undefined
  }

  private clear() {
    this.#three?.clear()
  }

  private redraw() {
    const three = this.#three
    if (!three) return

    three.clear()
    this.drawAxes()

    this.drawPolylineFromPoints()
  }

  private getViewportSize(): Viewport {
    const canvas = this.viewport
    const width = Math.max(1, Math.floor(canvas?.clientWidth ?? 0))
    const height = Math.max(1, Math.floor(canvas?.clientHeight ?? 0))
    return new Viewport(width, height)
  }

  private getCoordinates(): GraphicalCoordinateSystem | undefined {
    if (!this.#coords) return undefined
    this.#coords.updateViewport(this.getViewportSize())
    return this.#coords
  }

  private drawAxes() {
    const three = this.#three
    if (!three) return

    const { width, height } = this.getViewportSize()
    three.drawLine({ x: -width / 2, y: 0 }, { x: width / 2, y: 0 }, { color: 0x2a3555, opacity: 0.75 })
    three.drawLine({ x: 0, y: -height / 2 }, { x: 0, y: height / 2 }, { color: 0x2a3555, opacity: 0.75 })
  }

  private drawPolylineFromPoints() {
    const three = this.#three
    if (!three) return
    if (this.points.length === 0) return

    const coords = this.getCoordinates()
    const turtle = new Turtle()
    const cartPoints = this.points.map((p) => (coords ? coords.toCartesian(p) : p))
    if (cartPoints.length === 0) return

    let prev = cartPoints[0]!
    turtle.moveTo(prev)

    for (let i = 0; i < cartPoints.length; i++) {
      const p = cartPoints[i]!
      const s = 5
      three.drawLine({ x: p.x - s, y: p.y }, { x: p.x + s, y: p.y }, { color: 0xffd166, opacity: 1 })
      three.drawLine({ x: p.x, y: p.y - s }, { x: p.x, y: p.y + s }, { color: 0xffd166, opacity: 1 })
    }

    for (let i = 1; i < cartPoints.length; i++) {
      const base = cartPoints[i]!
      const target =
        this.behavior === 'turtle-centered'
          ? { x: turtle.position.x + base.x, y: turtle.position.y + base.y }
          : base
      const dx = target.x - turtle.position.x
      const dy = target.y - turtle.position.y
      const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI
      turtle.turn(angleDeg - turtle.heading)
      const next = turtle.forward(Math.hypot(dx, dy))
      three.drawLine(prev, next, { color: 0xffd166, opacity: 0.95 })
      prev = next
    }
  }

  private addPoint() {
    const last = this.points[this.points.length - 1] ?? { x: 0, y: 0 }
    this.points = [...this.points, { x: last.x + 40, y: last.y + 40 }]
    this.redraw()
  }

  private removePoint(index: number) {
    this.points = this.points.filter((_, i) => i !== index)
    this.redraw()
  }

  private onPointChange(e: CustomEvent<{ index: number; key: 'x' | 'y'; value: number }>) {
    const { index, key, value } = e.detail
    this.points = this.points.map((p, i) => (i === index ? { ...p, [key]: value } : p))
    this.redraw()
  }

  private onBehaviorChange(e: CustomEvent<{ behavior: 'absolute' | 'turtle-centered' }>) {
    this.behavior = e.detail.behavior
    this.redraw()
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
    }

    .layout {
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-columns: minmax(280px, 360px) 1fr;
      background: #0b1020;
    }

    .left {
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(12, 18, 34, 0.9);
      overflow: auto;
    }

    .right {
      position: relative;
      overflow: hidden;
    }

    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }


    @media (max-width: 900px) {
      .layout {
        grid-template-columns: 1fr;
        grid-template-rows: auto 1fr;
      }

      .left {
        border-right: none;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement
  }
}
