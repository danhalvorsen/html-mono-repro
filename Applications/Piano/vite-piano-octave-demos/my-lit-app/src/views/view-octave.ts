import { LitElement, css, html, type TemplateResult } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('view-octave')
export class ViewOctave extends LitElement {
  @property({ type: Number })
  octave = 4

  @property({ type: Boolean })
  showLabels = true

  private readonly keys = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

  static styles = css`
    :host {
      display: block;
    }
    .keyboard {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 0.5rem;
      margin-top: 1rem;
    }
    .key {
      min-height: 90px;
      border: 1px solid #d5dde7;
      border-radius: 8px;
      background: #fff;
      font-weight: 600;
    }
    @media (max-width: 700px) {
      .keyboard {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }
  `

  protected render(): TemplateResult {
    return html`
      <h2>Octave View (${this.octave})</h2>
      <div class="keyboard">
        ${this.keys.map(
          (key) => html`<button class="key">${this.showLabels ? `${key}${this.octave}` : key}</button>`,
        )}
      </div>
    `
  }
}
