// Applications/audio/WebAudio/application-web-audio/src/lit3/WebComponents/OscillatorControl/Atomic/MrOscillatorTypeSelect.ts

import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("mr-oscillator-type-select")
export class MrOscillatorTypeSelect extends LitElement {
  @property({ type: String })
  public value: OscillatorType = "sine";

  protected override render() {
    return html`
      <label>
        Waveform
        <select .value=${this.value} @change=${this.onChange}>
          <option value="sine">sine</option>
          <option value="square">square</option>
          <option value="sawtooth">sawtooth</option>
          <option value="triangle">triangle</option>
        </select>
      </label>
    `;
  }

  private readonly onChange = (event: Event): void => {
    const element = event.currentTarget;

    if (!(element instanceof HTMLSelectElement)) {
      return;
    }

    if (!this.isOscillatorType(element.value)) {
      return;
    }

    this.value = element.value;

    this.dispatchEvent(
      new CustomEvent<OscillatorType>("value-change", {
        detail: this.value,
        bubbles: true,
        composed: true,
      }),
    );
  };

  private isOscillatorType(value: string): value is OscillatorType {
    return value === "sine" ||
      value === "square" ||
      value === "sawtooth" ||
      value === "triangle";
  }
}