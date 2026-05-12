import type { IAudioSource } from '../IAudioSource';

export class OscillatorSource implements IAudioSource {
  readonly #oscillator: OscillatorNode;

  #started = false;
  #stopped = false;

  public constructor(oscillator: OscillatorNode) {
    this.#oscillator = oscillator;
  }

  public connect(input: AudioNode): void {
    this.#oscillator.connect(input);
  }

  public disconnect(): void {
    this.#oscillator.disconnect();
  }

  public start(): void {
    if (this.#started) {
      return;
    }

    if (this.#stopped) {
      throw new Error("Cannot restart a stopped oscillator source.");
    }

    this.#oscillator.start();
    this.#started = true;
  }

  public stop(): void {
    if (this.#stopped) {
      return;
    }

    try {
      if (this.#started) {
        this.#oscillator.stop();
      }
    } finally {
      this.disconnect();
      this.#stopped = true;
    }
  }

  public setFrequencyHz(value: number): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error("Oscillator frequency must be greater than 0.");
    }

    this.#oscillator.frequency.setValueAtTime(
      value,
      this.#oscillator.context.currentTime,
    );
  }
}