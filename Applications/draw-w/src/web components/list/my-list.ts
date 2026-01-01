import { LitElement, css, html } from 'lit'
import { customElement, query, state } from 'lit/decorators.js'
import type { Point2 } from '@monorepo/core-math'
import { Turtle } from '@monorepo/core-composition-svg-turtle'
import { ThreeCanvas } from '../../ThreeCanvas'

@customElement('my-list')
export class MyList extends LitElement {
  @query('#viewport') private viewport?: HTMLCanvasElement
  @state() private mode: 'spiral' | 'square' = 'spiral'
  @state() private points: Point2[] = [
    { x: -120, y: -60 },
    { x: 80, y: -10 },
    { x: 20, y: 120 },
  ]

  #three: ThreeCanvas | undefined

  render() {
    return html`
      <div class="wrap">
        <canvas id="viewport"></canvas>

        <div class="ui">
          <div class="row">
            <button
              part="button"
              class=${this.mode === 'spiral' ? 'active' : ''}
              @click=${() => this.setMode('spiral')}
            >
              Spiral
            </button>
            <button
              part="button"
              class=${this.mode === 'square' ? 'active' : ''}
              @click=${() => this.setMode('square')}
            >
              Square
            </button>
            <button part="button" @click=${() => this.redraw()}>Redraw</button>
            <button part="button" @click=${() => this.clear()}>Clear</button>
          </div>
          <div class="hint">Turtle: origin centered, +Y up.</div>

          <ul class="points" part="points">
            ${this.points.map(
              (p, index) => html`
                <li class="point" part="point">
                  <span class="label">P${index + 1}</span>
                  <label class="field">
                    <span class="fieldName">x</span>
                    <input
                      class="num"
                      type="number"
                      step="any"
                      .value=${String(p.x)}
                      @input=${(e: InputEvent) => this.onPointInput(index, 'x', e)}
                    />
                  </label>
                  <label class="field">
                    <span class="fieldName">y</span>
                    <input
                      class="num"
                      type="number"
                      step="any"
                      .value=${String(p.y)}
                      @input=${(e: InputEvent) => this.onPointInput(index, 'y', e)}
                    />
                  </label>
                  <button part="button" class="danger" @click=${() => this.removePoint(index)}>
                    Remove
                  </button>
                </li>
              `,
            )}
          </ul>

          <div class="row">
            <button part="button" @click=${() => this.addPoint()}>Add Point</button>
          </div>
        </div>
      </div>
    `
  }

  protected firstUpdated(): void {
    const canvas = this.viewport
    if (!canvas) return

    const three = new ThreeCanvas({ canvas, clearColor: 0x0b1020 })
    this.#three = three
    three.application.start()

    this.redraw()
  }

  disconnectedCallback(): void {
    super.disconnectedCallback()
    this.#three?.dispose()
    this.#three = undefined
  }

  private setMode(mode: 'spiral' | 'square') {
    this.mode = mode
    this.redraw()
  }

  private clear() {
    this.#three?.clear()
  }

  private redraw() {
    const three = this.#three
    if (!three) return

    three.clear()
    this.drawAxes()

    if (this.mode === 'spiral') this.drawSpiral()
    else this.drawSquare()

    this.drawPolylineFromPoints()
  }

  private drawAxes() {
    const three = this.#three
    if (!three) return

    const width = Math.max(1, this.clientWidth)
    const height = Math.max(1, this.clientHeight)
    three.drawLine({ x: -width / 2, y: 0 }, { x: width / 2, y: 0 }, { color: 0x2a3555, opacity: 0.75 })
    three.drawLine({ x: 0, y: -height / 2 }, { x: 0, y: height / 2 }, { color: 0x2a3555, opacity: 0.75 })
  }

  private drawSpiral() {
    const three = this.#three
    if (!three) return

    const turtle = new Turtle()
    let prev = turtle.position

    for (let i = 0; i < 280; i++) {
      turtle.turn(18)
      const next = turtle.forward(2 + i * 0.35)
      three.drawLine(prev, next, { color: 0x56d6ff, opacity: 1 })
      prev = next
    }
  }

  private drawSquare() {
    const three = this.#three
    if (!three) return

    const turtle = new Turtle()
    let prev = turtle.position

    for (let side = 0; side < 4; side++) {
      const next = turtle.forward(180)
      three.drawLine(prev, next, { color: 0x8bff7a, opacity: 1 })
      prev = next
      turtle.turn(90)
    }
  }

  private drawPolylineFromPoints() {
    const three = this.#three
    if (!three) return
    if (this.points.length === 0) return

    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i]!
      const s = 5
      three.drawLine({ x: p.x - s, y: p.y }, { x: p.x + s, y: p.y }, { color: 0xffd166, opacity: 1 })
      three.drawLine({ x: p.x, y: p.y - s }, { x: p.x, y: p.y + s }, { color: 0xffd166, opacity: 1 })
    }

    for (let i = 1; i < this.points.length; i++) {
      const a = this.points[i - 1]!
      const b = this.points[i]!
      three.drawLine(a, b, { color: 0xffd166, opacity: 0.95 })
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

  private onPointInput(index: number, key: keyof Point2, e: InputEvent) {
    const input = e.target as HTMLInputElement | null
    if (!input) return

    const nextValue = Number(input.value)
    const safeValue = Number.isFinite(nextValue) ? nextValue : 0

    this.points = this.points.map((p, i) => (i === index ? { ...p, [key]: safeValue } : p))
    this.redraw()
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
    }

    .wrap {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }

    .ui {
      position: absolute;
      left: 12px;
      top: 12px;
      display: grid;
      gap: 8px;
      padding: 10px;
      border-radius: 12px;
      background: rgba(12, 18, 34, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(8px);
      color: rgba(255, 255, 255, 0.9);
    }

    .row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .hint {
      color: rgba(255, 255, 255, 0.7);
      font-size: 12px;
    }

    .points {
      margin: 0;
      padding: 0;
      list-style: none;
      display: grid;
      gap: 8px;
      max-height: min(42vh, 360px);
      overflow: auto;
    }

    .point {
      display: grid;
      grid-template-columns: auto 1fr 1fr auto;
      gap: 8px;
      align-items: center;
      padding: 8px;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.04);
    }

    .label {
      font-size: 12px;
      opacity: 0.8;
      min-width: 28px;
    }

    .field {
      display: grid;
      grid-template-columns: 14px 1fr;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      opacity: 0.92;
    }

    .fieldName {
      opacity: 0.75;
    }

    input.num {
      width: 100%;
      min-width: 90px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(0, 0, 0, 0.25);
      color: rgba(255, 255, 255, 0.9);
      padding: 0.45em 0.6em;
      font: inherit;
      outline: none;
    }

    input.num:focus {
      border-color: rgba(86, 214, 255, 0.8);
    }

    button {
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 0.6em 1.2em;
      font-size: 1em;
      font-weight: 500;
      font-family: inherit;
      background-color: rgba(255, 255, 255, 0.08);
      color: inherit;
      cursor: pointer;
      transition: border-color 0.25s;
    }

    button:hover {
      border-color: rgba(86, 214, 255, 0.8);
    }

    button.active {
      border-color: rgba(86, 214, 255, 0.8);
    }

    button.danger:hover {
      border-color: rgba(255, 120, 120, 0.9);
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'my-list': MyList
  }
}
