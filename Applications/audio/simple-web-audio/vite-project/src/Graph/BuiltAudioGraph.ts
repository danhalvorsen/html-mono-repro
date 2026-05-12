import type { IAudioSource } from "../IAudioSource.ts";
import type { IAudioOutput } from "../Inputs/IAudioOutput.ts";

export class BuiltAudioGraph {
  readonly #source: IAudioSource;
  readonly #units: readonly IAudioOutput[];

  #started = false;
  #stopped = false;

  public constructor(source: IAudioSource, units: readonly IAudioOutput[]) {
    this.#source = source;
    this.#units = [...units];
  }

  public start(): void {
    if (this.#started) {
      return;
    }

    if (this.#stopped) {
      throw new Error("Cannot restart a stopped audio graph.");
    }

    this.#source.start();
    this.#started = true;
  }

  public stop(): void {
    if (this.#stopped) {
      return;
    }

    try {
      this.#source.stop();
    } finally {
      for (const unit of this.#units) {
        unit.disconnect();
      }

      this.#stopped = true;
    }
  }

  public setSourceFrequencyHz(value: number): void {
    this.#source.setFrequencyHz(value);
  }
}