// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/adsr-control.component.ts

import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { IVoiceDefinition } from "@monorepo/music-core-synthesizer-contracts";
import { AdsrEnvelope } from "@monorepo/music-core-synthesizer-envelopes";

export const AdsrControlEvents = {
  voiceDefinitionChanged: "voice-definition-changed",
} as const;

export type AdsrVoiceDefinitionChangedEvent = CustomEvent<{
  readonly definition: IVoiceDefinition;
}>;

@customElement("adsr-control")
export class AdsrControlComponent extends LitElement {
  @property({ attribute: false })
  public definition: IVoiceDefinition | null = null;

  public static override readonly styles = css`
    :host {
      display: block;
      padding: 12px;
      border: 1px solid #333;
      border-radius: 8px;
      max-width: 360px;
      font-family: system-ui, sans-serif;
    }

    h2 {
      margin: 0 0 12px;
      font-size: 18px;
    }

    .row {
      display: grid;
      gap: 6px;
      margin-bottom: 10px;
    }

    label {
      font-size: 13px;
      font-weight: 600;
    }

    input {
      padding: 6px;
    }
  `;

  protected override render() {
    if (!this.definition) {
      return html`<p>No voice definition.</p>`;
    }

    const envelope = this.definition.envelope as {
      readonly attackSeconds: number;
      readonly decaySeconds: number;
      readonly sustainLevel: number;
      readonly releaseSeconds: number;
    };

    return html`
      <section>
        <h2>ADSR</h2>

        ${this.renderSlider("Attack", "attackSeconds", envelope.attackSeconds, 0, 5, 0.01, "s")}
        ${this.renderSlider("Decay", "decaySeconds", envelope.decaySeconds, 0, 5, 0.01, "s")}
        ${this.renderSlider("Sustain", "sustainLevel", envelope.sustainLevel, 0, 1, 0.01, "")}
        ${this.renderSlider("Release", "releaseSeconds", envelope.releaseSeconds, 0, 5, 0.01, "s")}
      </section>
    `;
  }

  private renderSlider(
    label: string,
    key: "attackSeconds" | "decaySeconds" | "sustainLevel" | "releaseSeconds",
    value: number,
    min: number,
    max: number,
    step: number,
    suffix: string,
  ) {
    return html`
      <div class="row">
        <label for=${key}>${label}: ${value.toFixed(2)}${suffix}</label>
        <input
          id=${key}
          type="range"
          min=${String(min)}
          max=${String(max)}
          step=${String(step)}
          .value=${String(value)}
          @input=${(event: Event) => this.onValueChanged(event, key)}
        />
      </div>
    `;
  }

  private onValueChanged(
    event: Event,
    key: "attackSeconds" | "decaySeconds" | "sustainLevel" | "releaseSeconds",
  ): void {
    if (!this.definition) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    const current = this.definition.envelope as {
      readonly attackSeconds: number;
      readonly decaySeconds: number;
      readonly sustainLevel: number;
      readonly releaseSeconds: number;
    };

    const nextEnvelope = AdsrEnvelope.create({
      attackSeconds: key === "attackSeconds" ? value : current.attackSeconds,
      decaySeconds: key === "decaySeconds" ? value : current.decaySeconds,
      sustainLevel: key === "sustainLevel" ? value : current.sustainLevel,
      releaseSeconds: key === "releaseSeconds" ? value : current.releaseSeconds,
    });

    const next: IVoiceDefinition = {
      ...this.definition,
      envelope: nextEnvelope,
    };

    this.definition = next;

    this.dispatchEvent(
      new CustomEvent(AdsrControlEvents.voiceDefinitionChanged, {
        detail: { definition: next },
        bubbles: true,
        composed: true,
      }),
    );
  }
}