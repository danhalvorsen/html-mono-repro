// Applications/audio/WebAudio/application-web-audio/src/lit3/WebComponents/OscillatorControl/Atomic/MrSlider.ts

import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("mr-slider")
export class MrSlider extends LitElement {
  @property({ type: Number })
  public value = 0;

  @property({ type: Number })
  public min = 0;

  @property({ type: Number })
  public max = 1;

  @property({ type: Number })
  public step = 0.01;

  public static override styles = css`
    :host {
      display: block;
    }

    .container {
      display: grid;
      gap: 0.25rem;
    }

    input {
      width: 100%;
    }

    .value {
      font-size: 0.85rem;
      text-align: right;
    }
  `;

  protected override render() {
    return html`
      <div class="container">
        <input
          type="range"
          min=${this.min}
          max=${this.max}
          step=${this.step}
          .value=${String(this.value)}
          @input=${this.onInput}
        />
        <div class="value">${this.value.toFixed(2)}</div>
      </div>
    `;
  }

  private readonly onInput = (event: Event): void => {
    const element = event.currentTarget;

    if (!(element instanceof HTMLInputElement)) {
      return;
    }

    const value = Number(element.value);

    if (!Number.isFinite(value) || value === this.value) {
      return;
    }

    this.value = value;

    this.dispatchEvent(
      new CustomEvent<number>("value-change", {
        detail: value,
        bubbles: true,
        composed: true,
      }),
    );
  };
}