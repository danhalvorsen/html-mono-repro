import type { MixerBus } from "./MixerBus";
import type { ISynthesizer } from "./MakeIt";

 export class SimpleSynth implements ISynthesizer {

  public readonly output: AudioNode;

  private started = false;

  public constructor(
    private readonly oscillator: OscillatorNode,
    private readonly gain: GainNode,
    private readonly mixer: MixerBus
  ) {

    oscillator.connect(gain);
    gain.connect(mixer.input);

    this.output = mixer.output;
  }

  public connect(destination: AudioNode): void {
    this.output.connect(destination);
  }

  public disconnect(): void {
    this.output.disconnect();
  }

  public start(when = 0): void {

    if (this.started) return;

    this.oscillator.start(when);
    this.started = true;
  }

  public stop(when = 0): void {

    if (!this.started) return;

    this.oscillator.stop(when);
  }

  public dispose(): void {

    this.disconnect();

    this.oscillator.disconnect();
    this.gain.disconnect();
    this.mixer.dispose();
  }
}
