// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/distortion-control.component.ts

import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { IVoiceDefinition } from "@monorepo/music-core-synthesizer-contracts";
import { DistortionType } from "@monorepo/music-core-synthesizer-contracts";

export const DistortionControlEvents = {
  voiceDefinitionChanged: "voice-definition-changed",
} as const;

export type DistortionVoiceDefinitionChangedEvent = CustomEvent<{
  readonly definition: IVoiceDefinition;
}>;

@customElement("distortion-control")
export class DistortionControlComponent extends LitElement {
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

    select,
    input {
      padding: 6px;
    }
  `;

  protected override render() {
    if (!this.definition) {
      return html`<p>No voice definition.</p>`;
    }

    return html`
      <section>
        <h2>Distortion</h2>

        <div class="row">
          <label>
            <input
              type="checkbox"
              .checked=${this.definition.distortion.enabled}
              @change=${this.onEnabledChanged}
            />
            Enabled
          </label>
        </div>

        <div class="row">
          <label for="distortionType">Type</label>
          <select id="distortionType" @change=${this.onTypeChanged}>
            ${this.renderTypeOption(DistortionType.None, "None")}
            ${this.renderTypeOption(DistortionType.SoftClip, "Soft Clip")}
            ${this.renderTypeOption(DistortionType.HardClip, "Hard Clip")}
            ${this.renderTypeOption(DistortionType.Tanh, "Tanh")}
          </select>
        </div>

        <div class="row">
          <label for="distortionAmount">
            Amount: ${this.definition.distortion.amount.toFixed(2)}
          </label>
          <input
            id="distortionAmount"
            type="range"
            min="0"
            max="1"
            step="0.01"
            .value=${String(this.definition.distortion.amount)}
            @input=${this.onAmountChanged}
          />
        </div>
      </section>
    `;
  }

  private renderTypeOption(value: DistortionType, label: string) {
    return html`
      <option
        value=${value}
        ?selected=${this.definition?.distortion.type === value}
      >
        ${label}
      </option>
    `;
  }

  private onEnabledChanged = (event: Event): void => {
    const input = event.target as HTMLInputElement;

    this.patchDistortion({
      enabled: input.checked,
      type: input.checked && this.definition?.distortion.type === DistortionType.None
        ? DistortionType.Tanh
        : this.definition?.distortion.type ?? DistortionType.None,
    });
  };

  private onTypeChanged = (event: Event): void => {
    const select = event.target as HTMLSelectElement;
    const type = select.value as DistortionType;

    this.patchDistortion({
      type,
      enabled: type !== DistortionType.None,
      amount: type === DistortionType.None ? 0 : this.definition?.distortion.amount ?? 0,
    });
  };

  private onAmountChanged = (event: Event): void => {
    const input = event.target as HTMLInputElement;

    this.patchDistortion({
      amount: Number(input.value),
    });
  };

  private patchDistortion(
    patch: Partial<IVoiceDefinition["distortion"]>,
  ): void {
    if (!this.definition) {
      return;
    }

    const next: IVoiceDefinition = {
      ...this.definition,
      distortion: {
        ...this.definition.distortion,
        ...patch,
      },
    };

    this.definition = next;

    this.dispatchEvent(
      new CustomEvent(DistortionControlEvents.voiceDefinitionChanged, {
        detail: { definition: next },
        bubbles: true,
        composed: true,
      }),
    );
  }
}