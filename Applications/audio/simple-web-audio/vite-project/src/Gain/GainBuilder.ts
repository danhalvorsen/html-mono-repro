import { GainUnit } from "./GainUnit";

export class GainBuilder {
  readonly #context: AudioContext;

  #gain = 1;

  public constructor(context: AudioContext) {
    this.#context = context;
  }

  public gain(value: number): this {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new Error("Gain must be between 0 and 1.");
    }

    this.#gain = value;
    return this;
  }

  public build(): GainUnit {
    const gain = this.#context.createGain();
    gain.gain.value = this.#gain;

    return new GainUnit(gain);
  }
}