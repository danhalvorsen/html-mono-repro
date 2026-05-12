import { OscillatorSource } from "./OscillatorSource.ts";

export class OscillatorBuilder {
  readonly #context: AudioContext;

  #frequency = 440;
  #type: OscillatorType = "sawtooth";

  public constructor(context: AudioContext) {
    this.#context = context;
  }

  public frequency(value: number): this {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error("Oscillator frequency must be greater than 0.");
    }

    this.#frequency = value;
    return this;
  }

  public type(value: OscillatorType): this {
    this.#type = value;
    return this;
  }

  public build(): OscillatorSource {
    const oscillator = this.#context.createOscillator();
    oscillator.frequency.value = this.#frequency;
    oscillator.type = this.#type;

    return new OscillatorSource(oscillator);
  }
}