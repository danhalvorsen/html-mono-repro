import type { IAudioComponent, IAudioNodeFactory, IMixerConfig } from "./MakeIt";

// ============================================================
// Mixer
// ============================================================

export class MixerBus implements IAudioComponent {

  public readonly input: GainNode;
  public readonly output: GainNode;

  public constructor(factory: IAudioNodeFactory, config: IMixerConfig) {

    const mixer = factory.createMixer(config);

    this.input = mixer;
    this.output = mixer;
  }

  public connect(destination: AudioNode): void {
    this.output.connect(destination);
  }

  public disconnect(): void {
    this.output.disconnect();
  }

  public dispose(): void {
    this.disconnect();
  }
}
