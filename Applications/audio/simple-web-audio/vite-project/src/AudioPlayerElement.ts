// FILE: src/AudioPlayerElement.ts

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { AudioGraphBuilder } from './AudioGraphBuilder';
import { FilterBuilder } from './FilterBuilder';
import { OscillatorBuilder } from './OscillatorBuilder';

@customElement('audio-player')
export class AudioPlayerElement extends LitElement {
  readonly #context = new AudioContext();

  protected render(): unknown {
    return html`
      <button @click=${this.#play}>Play</button>
    `;
  }

  async #play(): Promise<void> {
    await this.#context.resume();

    const oscillator = new OscillatorBuilder(this.#context)
      .type('sawtooth')
      .frequency(440)
      .build();

    const filter = new FilterBuilder(this.#context)
      .type('lowpass')
      .frequency(800)
      .q(4)
      .build();

    const graph = new AudioGraphBuilder(this.#context)
      .source(oscillator)
      .add(filter)
      .connectToDestination();

    graph.start();

    window.setTimeout(() => {
      graph.stop();
    }, 1000);
  }
}