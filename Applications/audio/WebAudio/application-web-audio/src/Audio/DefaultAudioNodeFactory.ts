// Applications/audio/WebAudio/application-web-audio/src/Audio/DefaultAudioNodeFactory.ts

import {
  Guard,
  type IAudioNodeFactory,
  type IGainConfig,
  type IMixerConfig,
  type IOscillatorConfig,
} from "./MakeIt.js";

export class DefaultAudioNodeFactory implements IAudioNodeFactory {
  public constructor(private readonly context: BaseAudioContext) {}

  public createOscillator(config: IOscillatorConfig): OscillatorNode {
    Guard.positive("frequency", config.frequency);

    const node = this.context.createOscillator();
    node.type = config.type;
    node.frequency.value = config.frequency;
    node.detune.value = config.detune;

    return node;
  }

  public createGain(config: IGainConfig): GainNode {
    Guard.gain("gain", config.gain);

    const node = this.context.createGain();
    node.gain.value = config.gain;

    return node;
  }

  public createMixer(config: IMixerConfig): GainNode {
    Guard.gain("level", config.level);

    const node = this.context.createGain();
    node.gain.value = config.level;

    return node;
  }
}