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
      color: #e8ecf1;
      font-family: system-ui, sans-serif;
    }

    .card {
      display: grid;
      grid-template-rows: auto 1fr auto;
      border: 1px solid #3a4352;
      border-radius: 12px;
      background: #1b2230;
      overflow: hidden;
      box-shadow: 0 4px 18px rgb(0 0 0 / 22%);
    }

    .card__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.85rem 1rem;
      border-bottom: 1px solid #313949;
      background: #222b3a;
    }

    .card__title-group {
      display: grid;
      gap: 0.15rem;
      min-width: 0;
    }

    .card__title {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    .card__subtitle {
      font-size: 0.78rem;
      color: #9da9bb;
    }

    .card__main {
      display: grid;
      gap: 1rem;
      padding: 1rem;
    }

    .field {
      display: grid;
      gap: 0.35rem;
    }

    .field__label {
      font-size: 0.82rem;
      font-weight: 600;
      color: #c6d0de;
    }

    .card__footer {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-top: 1px solid #313949;
      background: #202837;
      font-size: 0.78rem;
      color: #9da9bb;
    }

    .metric {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      white-space: nowrap;
    }

    .metric__value {
      color: #e8ecf1;
      font-variant-numeric: tabular-nums;
    }
  `;

  protected override render() {
    return html`
      <article class="card">
        <header class="card__header">
          <div class="card__title-group">
            <h3 class="card__title">${this.model.id}</h3>
            <div class="card__subtitle">Wave source and level shaping</div>
          </div>

          <mr-oscillator-type-select
            .value=${this.model.type}
            @value-change=${this.onTypeChange}>
          </mr-oscillator-type-select>
        </header>

        <main class="card__main">
          <div class="field">
            <label class="field__label">Frequency</label>
            <mr-slider
              .value=${this.model.frequency}
              .min=${10}
              .max=${2000}
              .step=${1}
              @value-change=${this.onFrequencyChange}>
            </mr-slider>
          </div>

          <div class="field">
            <label class="field__label">Detune</label>
            <mr-slider
              .value=${this.model.detune}
              .min=${-1200}
              .max=${1200}
              .step=${1}
              @value-change=${this.onDetuneChange}>
            </mr-slider>
          </div>

          <div class="field">
            <label class="field__label">Gain</label>
            <mr-slider
              .value=${this.model.gain}
              .min=${0}
              .max=${1}
              .step=${0.01}
              @value-change=${this.onGainChange}>
            </mr-slider>
          </div>
        </main>

        <footer class="card__footer">
          <span class="metric">
            Type:
            <span class="metric__value">${this.model.type}</span>
          </span>

          <span class="metric">
            Gain:
            <span class="metric__value">${this.model.gain.toFixed(2)}</span>
          </span>
        </footer>
      </article>
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