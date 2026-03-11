import type { MixerBus } from "./MixerBus.js";
import type { ISynthesizer } from "./MakeIt.js";

export class SimpleSynth implements ISynthesizer {
  public readonly output: AudioNode;
  private started = false;

  public constructor(
    private readonly oscillators: readonly OscillatorNode[],
    private readonly gains: readonly GainNode[],
    private readonly mixer: MixerBus,
  ) {
    this.output = mixer.output;
  }

  public connect(destination: AudioNode): void {
    this.output.connect(destination);
  }

  public disconnect(): void {
    this.output.disconnect();
  }

  public start(when = 0): void {
    if (this.started) {
      return;
    }

    for (const oscillator of this.oscillators) {
      oscillator.start(when);
    }

    this.started = true;
  }

  public stop(when = 0): void {
    if (!this.started) {
      return;
    }

    for (const oscillator of this.oscillators) {
      try {
        oscillator.stop(when);
      } catch {
        // ignored by design
      }
    }

    this.started = false;
  }

  public dispose(): void {
    this.disconnect();

    for (const oscillator of this.oscillators) {
      oscillator.disconnect();
    }

    for (const gain of this.gains) {
      gain.disconnect();
    }

    this.mixer.dispose();
  }
}
