import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { Point2 } from '@monorepo/core-math'
import './label-wc'
@customElement('my-point-view')
export class PointView extends LitElement {
  @property({ attribute: false }) points: Point2[] = []
  @property() behavior: 'absolute' | 'turtle-centered' = 'absolute'

  render() {
    return html`
      <div class="ui">
        <div class="row">
          <button part="button" @click=${() => this.emit('redraw')}>Redraw</button>
          <button part="button" @click=${() => this.emit('clear')}>Clear</button>
          <button part="button" @click=${() => this.toggleBehavior()}>
            Behavior: ${this.behavior === 'absolute' ? 'Absolute' : 'Centered'}
          </button>
        </div>
        <div class="hint">Turtle: origin centered, +Y up.</div>

        <ul class="points" part="points">
          ${this.points.map(
            (p, index) => html`
              <li class="point" part="point">
                <span class="label">P${index + 1}</span>
                <label-wc
                  name="x"
                  .value=${p.x}
                  @value-input=${(e: CustomEvent<{ name: string; value: number }>) =>
                    this.onLabelValueInput(index, e)}
                ></label-wc>
                <label-wc
                  name="y"
                  .value=${p.y}
                  @value-input=${(e: CustomEvent<{ name: string; value: number }>) =>
                    this.onLabelValueInput(index, e)}
                ></label-wc>
                <button part="button" class="danger" @click=${() => this.emit('remove-point', { index })}>
                  Remove
                </button>
              </li>
            `,
          )}
        </ul>

        <div class="row">
          <button part="button" @click=${() => this.emit('add-point')}>Add Point</button>
        </div>
      </div>
    `
  }

  private onLabelValueInput(index: number, e: CustomEvent<{ name: string; value: number }>) {
    const key = e.detail.name === 'y' ? 'y' : 'x'
    this.emit('point-change', { index, key, value: e.detail.value })
  }

  private emit<T>(type: string, detail?: T) {
    this.dispatchEvent(
      new CustomEvent<T>(type, {
        detail,
        bubbles: true,
        composed: true,
      }),
    )
  }

  private toggleBehavior() {
    const next = this.behavior === 'absolute' ? 'turtle-centered' : 'absolute'
    this.emit('behavior-change', { behavior: next })
  }

  static styles = css`
    :host {
      display: block;
      height: 100%;
    }

    .ui {
      display: grid;
      gap: 8px;
      padding: 14px;
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

    label-wc {
      font-size: 12px;
      opacity: 0.92;
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

    button.danger:hover {
      border-color: rgba(255, 120, 120, 0.9);
    }
  `
}
