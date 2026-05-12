import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

import { FilterBuilder } from "./Filters/FilterBuilder";

import { VoiceBuilder } from "./Voice/VoiceBuilder";
import type { IVoice } from "./Voice/IVoice.ts";

@customElement("audio-player")
export class AudioPlayerElement extends LitElement {
  readonly #context = new AudioContext();

  #voice: IVoice | null = null;
  #frequencyHz = 440;

  protected render(): unknown {
    return html`
      <button @click=${this.#play}>Play voice</button>
    `;
  }

  async #play(): Promise<void> {
    await this.#context.resume();

    this.#voice?.dispose();

    const filter = new FilterBuilder(this.#context)
      .type("lowpass")
      .frequency(800)
      .q(4)
      .build();

    const voice = new VoiceBuilder(this.#context)
      .noteNumber(69)
      .velocity(0.25)
      .oscillatorType("sawtooth")
      .frequencyStrategy({
        toFrequencyHz: () => this.#frequencyHz,
      })
      .add(filter)
      .build();

    this.#voice = voice;
    voice.start();

    window.setTimeout(() => {
      voice.dispose();

      if (this.#voice === voice) {
        this.#voice = null;
      }
    }, 1000);
  }

  public setFrequencyHz(value: number): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error("Frequency must be greater than 0.");
    }

    this.#frequencyHz = value;
    this.#voice?.setFrequencyHz(value);
  }
}