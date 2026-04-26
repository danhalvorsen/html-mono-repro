import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import {
  EnvelopeCurveKind,
  EnvelopeKind,
  type IAdsrEnvelopeDefinition,
} from "@monorepo/music-core-synthesizer-envelopes-contracts";

export const AdsrEnvelopeControlEvent = {
  Changed: "adsr-envelope-control-changed",
} as const;

export interface IAdsrEnvelopeControlChangedDetail {
  readonly definition: IAdsrEnvelopeDefinition;
}

@customElement("adsr-envelope-control")
export class AdsrEnvelopeControlComponent extends LitElement {
  @property({ attribute: false })
  public definition: IAdsrEnvelopeDefinition =
    DefaultAdsrEnvelopeDefinitionFactory.create();

  public static override readonly styles = css`
    :host {
      display: grid;
      gap: 10px;
      padding: 12px;
      border: 1px solid #333;
      border-radius: 8px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
    }

    .row {
      display: grid;
      gap: 4px;
    }

    label {
      font-size: 13px;
      font-weight: 600;
    }

    input {
      width: 100%;
    }

    output {
      font-variant-numeric: tabular-nums;
    }
  `;

  protected override render() {
    return html`
      <section>
        <div class="header">
          <strong>ADSR Envelope</strong>
          <span>${this.definition.kind}</span>
        </div>

        ${this.renderSecondsSlider("Attack", "attackSeconds", 0, 2, 0.01)}
        ${this.renderSecondsSlider("Decay", "decaySeconds", 0, 2, 0.01)}
        ${this.renderLevelSlider("Sustain", "sustainLevel", 0, 1, 0.01)}
        ${this.renderSecondsSlider("Release", "releaseSeconds", 0, 4, 0.01)}
      </section>
    `;
  }

  private renderSecondsSlider(
    label: string,
    key: keyof Pick<IAdsrEnvelopeDefinition, "attackSeconds" | "decaySeconds" | "releaseSeconds">,
    minimum: number,
    maximum: number,
    step: number,
  ) {
    const value = this.definition[key];

    return html`
      <div class="row">
        <label>
          ${label}: <output>${value.toFixed(2)}s</output>
        </label>
        <input
          type="range"
          min=${String(minimum)}
          max=${String(maximum)}
          step=${String(step)}
          .value=${String(value)}
          @input=${(event: Event) => this.patchNumber(key, event)}
        />
      </div>
    `;
  }

  private renderLevelSlider(
    label: string,
    key: keyof Pick<IAdsrEnvelopeDefinition, "sustainLevel">,
    minimum: number,
    maximum: number,
    step: number,
  ) {
    const value = this.definition[key];

    return html`
      <div class="row">
        <label>
          ${label}: <output>${value.toFixed(2)}</output>
        </label>
        <input
          type="range"
          min=${String(minimum)}
          max=${String(maximum)}
          step=${String(step)}
          .value=${String(value)}
          @input=${(event: Event) => this.patchNumber(key, event)}
        />
      </div>
    `;
  }

  private patchNumber(
    key: keyof Pick<
      IAdsrEnvelopeDefinition,
      "attackSeconds" | "decaySeconds" | "sustainLevel" | "releaseSeconds"
    >,
    event: Event,
  ): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    if (!Number.isFinite(value)) {
      return;
    }

    this.definition = {
      ...this.definition,
      [key]: value,
    };

    this.dispatchChanged();
  }

  private dispatchChanged(): void {
    this.dispatchEvent(
      new CustomEvent<IAdsrEnvelopeControlChangedDetail>(
        AdsrEnvelopeControlEvent.Changed,
        {
          bubbles: true,
          composed: true,
          detail: {
            definition: this.definition,
          },
        },
      ),
    );
  }
}

export class DefaultAdsrEnvelopeDefinitionFactory {
  public static create(): IAdsrEnvelopeDefinition {
    return {
      kind: EnvelopeKind.Adsr,
      attackSeconds: 0.02,
      decaySeconds: 0.14,
      sustainLevel: 0.62,
      releaseSeconds: 0.35,
      attackCurve: { kind: EnvelopeCurveKind.Linear },
      decayCurve: { kind: EnvelopeCurveKind.Linear },
      releaseCurve: { kind: EnvelopeCurveKind.Linear },
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "adsr-envelope-control": AdsrEnvelopeControlComponent;
  }
}
