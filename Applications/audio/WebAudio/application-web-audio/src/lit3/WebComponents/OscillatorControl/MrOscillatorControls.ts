// Applications/audio/WebAudio/application-web-audio/src/lit3/WebComponents/OscillatorControl/MrOscillatorControls.ts

import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./Atomic/MrOscillatorTypeSelect.js";
import "./Atomic/MrSlider.js";
import type { OscillatorModel } from "./OscillatorModel.js";

@customElement("mr-oscillator-controls")
export class MrOscillatorControls extends LitElement {
  @property({ attribute: false })
  public model: OscillatorModel = {
    id: "osc-1",
    type: "sine",
    frequency: 440,
    detune: 0,
    gain: 0.25,
  };

  public static override styles = css`
    :host {
      display: block;
      padding: 0.75rem;
      border: 1px solid #444;
      border-radius: 8px;
    }

    .panel {
      display: grid;
      gap: 0.75rem;
    }

    label {
      display: grid;
      gap: 0.25rem;
    }
  `;

  protected override render() {
    return html`
      <div class="panel">
        <mr-oscillator-type-select
          .value=${this.model.type}
          @value-change=${this.onTypeChange}>
        </mr-oscillator-type-select>

        <label>
          Frequency
          <mr-slider
            .value=${this.model.frequency}
            .min=${20}
            .max=${2000}
            .step=${1}
            @value-change=${this.onFrequencyChange}>
          </mr-slider>
        </label>

        <label>
          Detune
          <mr-slider
            .value=${this.model.detune}
            .min=${-1200}
            .max=${1200}
            .step=${1}
            @value-change=${this.onDetuneChange}>
          </mr-slider>
        </label>

        <label>
          Gain
          <mr-slider
            .value=${this.model.gain}
            .min=${0}
            .max=${1}
            .step=${0.01}
            @value-change=${this.onGainChange}>
          </mr-slider>
        </label>
      </div>
    `;
  }

  private readonly onTypeChange = (event: CustomEvent<OscillatorType>): void => {
    this.updateModel({ type: event.detail });
  };

  private readonly onFrequencyChange = (event: CustomEvent<number>): void => {
    this.updateModel({ frequency: event.detail });
  };

  private readonly onDetuneChange = (event: CustomEvent<number>): void => {
    this.updateModel({ detune: event.detail });
  };

  private readonly onGainChange = (event: CustomEvent<number>): void => {
    this.updateModel({ gain: event.detail });
  };

  private updateModel(patch: Partial<OscillatorModel>): void {
    this.model = {
      ...this.model,
      ...patch,
    };

    this.dispatchEvent(
      new CustomEvent<OscillatorModel>("oscillator-change", {
        detail: this.model,
        bubbles: true,
        composed: true,
      }),
    );
  }
}