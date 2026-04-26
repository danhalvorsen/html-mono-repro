// FILE: test-playground/modules-basic-tester/src/features/soundTestFeature/two-oscillator-demo.component.ts

import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";

import type { OscillatorDefinition } from "@monorepo/music-core-synthesizer-oscillators-contracts";
 
import type { MidiMessageStreamEvent } from "./midi-controller.component.js";
import "./midi-controller.component.js";

type OscillatorDefinitionChangedEvent = CustomEvent<{
  readonly definition: OscillatorDefinition;
}>;
import {
  SoundController,
  type OscillatorIndex,
} from "./SoundController.js";

@customElement("two-oscillator-demo")
export class TwoOscillatorDemoComponent extends LitElement {
  private readonly soundController = new SoundController();

  @state()
  private status = "Ready";

  @state()
  private oscillatorADefinition = this.soundController.getOscillatorDefinition(0);

  @state()
  private oscillatorBDefinition = this.soundController.getOscillatorDefinition(1);

  public static override readonly styles = css`
    :host {
      display: block;
    }

    .layout {
      display: grid;
      gap: 16px;
    }

    .toolbar {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: center;
    }

    button {
      padding: 8px 12px;
      font: inherit;
      cursor: pointer;
    }

    .status {
      padding: 8px 12px;
      border: 1px solid #333;
      border-radius: 8px;
      font-size: 13px;
    }

    .controls {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      align-items: flex-start;
    }
  `;

  public override render() {
    return html`
      <section class="layout">
        <h1>Oscillator View</h1>

        <div class="toolbar">
          <button type="button" @click=${this.playC4}>Play C4</button>
          <button type="button" @click=${this.stop}>Stop</button>
        </div>

        <div class="status">${this.status}</div>

        <div class="controls">
          <oscillator-control
            label="Oscillator A"
            .definition=${this.oscillatorADefinition}
            @oscillator-control-definition-changed=${(
              event: OscillatorDefinitionChangedEvent,
            ) => this.onOscillatorDefinitionChanged(0, event)}
          ></oscillator-control>

          <oscillator-control
            label="Oscillator B"
            .definition=${this.oscillatorBDefinition}
            @oscillator-control-definition-changed=${(
              event: OscillatorDefinitionChangedEvent,
            ) => this.onOscillatorDefinitionChanged(1, event)}
          ></oscillator-control>

          <midi-controller
            @midi-message=${this.onMidiMessage}
            @midi-song-started=${this.onMidiStarted}
            @midi-song-stopped=${this.onMidiStopped}
            @midi-song-completed=${this.onMidiCompleted}
          ></midi-controller>
        </div>
      </section>
    `;
  }

  public override disconnectedCallback(): void {
    this.soundController.noteOff();
    super.disconnectedCallback();
  }

  private readonly playC4 = async (): Promise<void> => {
    await this.soundController.init();
    this.soundController.noteOn(60, 0.85);
    this.status = "Playing C4 with two oscillators";
  };

  private readonly stop = (): void => {
    this.soundController.noteOff();
    this.status = "Stopped";
  };

  private onOscillatorDefinitionChanged(
    index: OscillatorIndex,
    event: OscillatorDefinitionChangedEvent,
  ): void {
    this.soundController.setOscillatorDefinition(index, event.detail.definition);

    if (index === 0) {
      this.oscillatorADefinition = event.detail.definition;
    } else {
      this.oscillatorBDefinition = event.detail.definition;
    }

    this.status = `Oscillator ${index === 0 ? "A" : "B"} changed`;
  }

  private readonly onMidiStarted = async (): Promise<void> => {
    await this.soundController.init();
    this.status = "MIDI started";
  };

  private readonly onMidiMessage = async (
    event: MidiMessageStreamEvent,
  ): Promise<void> => {
    await this.soundController.handleMidiMessage(event.detail.message);
    this.status = `MIDI step ${event.detail.stepIndex + 1}: ${event.detail.step.token}`;
  };

  private readonly onMidiStopped = (): void => {
    this.soundController.noteOff();
    this.status = "MIDI stopped";
  };

  private readonly onMidiCompleted = (): void => {
    this.soundController.noteOff();
    this.status = "MIDI completed";
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "two-oscillator-demo": TwoOscillatorDemoComponent;
  }
}
