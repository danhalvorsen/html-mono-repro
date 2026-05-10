import { LitElement, css, html, type TemplateResult } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('view-settings')
export class ViewSettings extends LitElement {
  @property({ type: Number })
  octave = 4

  @property({ type: Boolean })
  showLabels = true

  static styles = css`
    :host {
      display: block;
    }
    h2 {
      margin: 0 0 10px;
    }
    label {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin: 0.75rem 0;
    }
    input[type='range'] {
      width: min(360px, 70vw);
    }
  `

  private onOctaveInput(event: Event): void {
    const target = event.currentTarget as HTMLInputElement
    this.dispatchEvent(
      new CustomEvent<number>('octave-change', {
        detail: Number(target.value),
        bubbles: true,
        composed: true,
      }),
    )
  }

  private onShowLabelsChange(event: Event): void {
    const target = event.currentTarget as HTMLInputElement
    this.dispatchEvent(
      new CustomEvent<boolean>('label-visibility-change', {
        detail: target.checked,
        bubbles: true,
        composed: true,
      }),
    )
  }

  protected render(): TemplateResult {
    return html`
      <h2>Settings View</h2>
      <label>
        Octave
        <input type="range" min="1" max="7" .value=${String(this.octave)} @input=${this.onOctaveInput} />
        <span>${this.octave}</span>
      </label>
      <label>
        <input type="checkbox" .checked=${this.showLabels} @change=${this.onShowLabelsChange} />
        Show full note labels
      </label>
    `
  }
}
