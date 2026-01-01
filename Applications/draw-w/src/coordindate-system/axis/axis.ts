import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { AxisId } from '../types/AxisId'
import { AxisInterval } from '../types/AxisInterval'

@customElement('axis-wc')
export class AxisWC extends LitElement {
  @property({ attribute: 'id' }) id = 'x'
  @property({ attribute: false }) interval = new AxisInterval(-10, 10)

  render() {
    return html`<div class="axis" part="axis"><slot></slot></div>`
  }

  protected firstUpdated(): void {
    this.addEventListener('click', (event) => {
      const axisId = AxisId.from(this.id)
      this.dispatchEvent(
        new CustomEvent('axis-click', {
          detail: { id: axisId, interval: this.interval, event },
          bubbles: true,
          composed: true,
        }),
      )
    })

    this.addEventListener('pointerdown', (event) => this.handleDragStart(event))
  }

  private handleDragStart(event: PointerEvent) {
    const start = { x: event.clientX, y: event.clientY }
    this.setPointerCapture(event.pointerId)

    const move = (moveEvent: PointerEvent) => {
      this.dispatchEvent(
        new CustomEvent('axis-drag', {
          detail: {
            id: AxisId.from(this.id),
            interval: this.interval,
            delta: { x: moveEvent.clientX - start.x, y: moveEvent.clientY - start.y },
            event: moveEvent,
          },
          bubbles: true,
          composed: true,
        }),
      )
    }

    const end = (endEvent: PointerEvent) => {
      this.releasePointerCapture(event.pointerId)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', end)
      this.dispatchEvent(
        new CustomEvent('axis-drag-end', {
          detail: { id: AxisId.from(this.id), interval: this.interval, event: endEvent },
          bubbles: true,
          composed: true,
        }),
      )
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', end, { once: true })
  }

  static styles = css`
    :host {
      display: contents;
    }

    .axis {
      display: block;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'axis-wc': AxisWC
  }
}
