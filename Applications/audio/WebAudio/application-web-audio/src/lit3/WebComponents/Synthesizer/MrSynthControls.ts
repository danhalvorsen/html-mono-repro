// Applications/audio/WebAudio/application-web-audio/src/lit3/WebComponents/Synthesizer/MrSynthControls.ts

import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "../MrSynthToggle.js";
import "../OscillatorControl/MrOscillatorControls.js";

import type { OscillatorModel } from "../OscillatorControl/OscillatorModel.js";
import type { SynthesizerModel } from "./SynthesizerModel.js";
import { SynthesizerController } from "./SynthesizerController.js";

@customElement("mr-synth-controls")
export class MrSynthControls extends LitElement {
  @property({ attribute: false })
  public model: SynthesizerModel = {
    oscillators: [],
    mixerLevel: 1,
  };

  @state()
  private playing = false;

  private readonly controller = new SynthesizerController();

  protected override render() {
    return html`
      <mr-synth-toggle
        .playing=${this.playing}
        @toggle-requested=${this.onToggleRequested}
      >
      </mr-synth-toggle>

      <ul>
        ${this.model.oscillators.map(
          (oscillator) => html`
            <li>
              <mr-oscillator-controls
                .model=${oscillator}
                @oscillator-change=${this.onOscillatorChanged}
              >
              </mr-oscillator-controls>
            </li>
          `,
        )}
      </ul>
    `;
  }

  public override disconnectedCallback(): void {
    this.controller.dispose();
    super.disconnectedCallback();
  }

  private readonly onToggleRequested = async (): Promise<void> => {
    await this.controller.toggle();

    this.playing = this.controller.isPlaying;
    this.model = this.controller.synthesizerModel;
  };

  private readonly onOscillatorChanged = (
    event: CustomEvent<OscillatorModel>,
  ): void => {
    const updated = event.detail;

    this.model = {
      ...this.model,
      oscillators: this.model.oscillators.map((oscillator) =>
        oscillator.id === updated.id ? updated : oscillator,
      ),
    };

    this.dispatchEvent(
      new CustomEvent<SynthesizerModel>("synthesizer-change", {
        detail: this.model,
        bubbles: true,
        composed: true,
      }),
    );
  };
}
