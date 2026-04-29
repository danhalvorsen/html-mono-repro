import { LitElement, css, html } from "lit";

import {
  OscillatorKind,
  OscillatorWaveformKind,
  type IBasicOscillatorDefinition,
  type OscillatorDefinition,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

export const OscillatorControlElementName = {
  Value: "oscillator-control",
} as const;

export const OscillatorControlElementId = {
  Waveform: "waveform",
  Frequency: "frequency",
  FrequencyOutput: "frequency-output",
  Detune: "detune",
  DetuneOutput: "detune-output",
  Gain: "gain",
  GainOutput: "gain-output",
} as const;

export const OscillatorControlEvent = {
  DefinitionChanged: "oscillator-control-definition-changed",
} as const;

export interface IOscillatorDefinitionChangedDetail {
  readonly definition: OscillatorDefinition;
}

export interface IOscillatorControlComponentProperties {
  readonly label: string;
  readonly definition: OscillatorDefinition;
}

export class OscillatorControlComponent extends LitElement {
  public static override readonly properties = {
    label: { type: String },
    definition: { attribute: false },
  };

  public label: string;
  public definition: OscillatorDefinition;

  public constructor() {
    super();

    this.label = "Oscillator";
    this.definition = DefaultOscillatorDefinitionFactory.create();
  }

  public static override readonly styles = css`
    :host {
      display: grid;
      gap: 10px;
      padding: 12px;
      border: 1px solid #333;
      border-radius: 8px;
      max-width: 360px;
      font-family: system-ui, sans-serif;
    }

    .row {
      display: grid;
      gap: 4px;
    }

    label {
      font-size: 13px;
      font-weight: 600;
    }

    input,
    select {
      width: 100%;
    }

    output {
      font-variant-numeric: tabular-nums;
    }
  `;

  protected override render() {
    const definition = BasicOscillatorDefinitionGuard.require(this.definition);

    return html`
      <strong>${this.label}</strong>

      <div class="row">
        <label for=${OscillatorControlElementId.Waveform}>Waveform</label>
        <select
          id=${OscillatorControlElementId.Waveform}
          .value=${definition.waveform}
          @change=${this.onWaveformChanged}
        >
          <option value=${OscillatorWaveformKind.Sine}>sine</option>
          <option value=${OscillatorWaveformKind.Square}>square</option>
          <option value=${OscillatorWaveformKind.Sawtooth}>sawtooth</option>
          <option value=${OscillatorWaveformKind.Triangle}>triangle</option>
        </select>
      </div>

      <div class="row">
        <label>
          Frequency:
          <output id=${OscillatorControlElementId.FrequencyOutput}>
            ${String(definition.frequencyHz)}
          </output>
        </label>
        <input
          id=${OscillatorControlElementId.Frequency}
          type="range"
          min="20"
          max="2000"
          step="1"
          .value=${String(definition.frequencyHz)}
          @input=${this.onFrequencyChanged}
        />
      </div>

      <div class="row">
        <label>
          Detune:
          <output id=${OscillatorControlElementId.DetuneOutput}>
            ${String(definition.detuneCents)}
          </output>
        </label>
        <input
          id=${OscillatorControlElementId.Detune}
          type="range"
          min="-1200"
          max="1200"
          step="1"
          .value=${String(definition.detuneCents)}
          @input=${this.onDetuneChanged}
        />
      </div>

      <div class="row">
        <label>
          Gain:
          <output id=${OscillatorControlElementId.GainOutput}>
            ${String(definition.gain)}
          </output>
        </label>
        <input
          id=${OscillatorControlElementId.Gain}
          type="range"
          min="0"
          max="1"
          step="0.01"
          .value=${String(definition.gain)}
          @input=${this.onGainChanged}
        />
      </div>
    `;
  }

  private readonly onWaveformChanged = (event: Event): void => {
    const select = HtmlElementGuard.requireSelect(event.target);
    this.patchDefinition({ waveform: select.value as IBasicOscillatorDefinition["waveform"] });
  };

  private readonly onFrequencyChanged = (event: Event): void => {
    const input = HtmlElementGuard.requireInput(event.target);
    this.patchDefinition({ frequencyHz: Number(input.value) });
  };

  private readonly onDetuneChanged = (event: Event): void => {
    const input = HtmlElementGuard.requireInput(event.target);
    this.patchDefinition({ detuneCents: Number(input.value) });
  };

  private readonly onGainChanged = (event: Event): void => {
    const input = HtmlElementGuard.requireInput(event.target);
    this.patchDefinition({ gain: Number(input.value) });
  };

  private patchDefinition(
    patch: Partial<IBasicOscillatorDefinition>,
  ): void {
    const current = BasicOscillatorDefinitionGuard.require(this.definition);

    this.definition = {
      ...current,
      ...patch,
    };

    this.dispatchEvent(
      new CustomEvent<IOscillatorDefinitionChangedDetail>(
        OscillatorControlEvent.DefinitionChanged,
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

export class DefaultOscillatorDefinitionFactory {
  public static create(): IBasicOscillatorDefinition {
    return {
      kind: OscillatorKind.Basic,
      waveform: OscillatorWaveformKind.Sine,
      frequencyHz: 440,
      detuneCents: 0,
      phaseRadians: 0,
      gain: 1,
    };
  }
}

export class BasicOscillatorDefinitionGuard {
  public static require(
    definition: OscillatorDefinition,
  ): IBasicOscillatorDefinition {
    if (definition.kind !== OscillatorKind.Basic) {
      return DefaultOscillatorDefinitionFactory.create();
    }

    return definition;
  }
}

export class HtmlElementGuard {
  public static requireInput(candidate: EventTarget | null): HTMLInputElement {
    if (!(candidate instanceof HTMLInputElement)) {
      throw new Error("Expected event target to be an HTMLInputElement.");
    }

    return candidate;
  }

  public static requireSelect(candidate: EventTarget | null): HTMLSelectElement {
    if (!(candidate instanceof HTMLSelectElement)) {
      throw new Error("Expected event target to be an HTMLSelectElement.");
    }

    return candidate;
  }
}

if (customElements.get(OscillatorControlElementName.Value) === undefined) {
  customElements.define(
    OscillatorControlElementName.Value,
    OscillatorControlComponent,
  );
}

declare global {
  interface HTMLElementTagNameMap {
    "oscillator-control": OscillatorControlComponent;
  }
}
