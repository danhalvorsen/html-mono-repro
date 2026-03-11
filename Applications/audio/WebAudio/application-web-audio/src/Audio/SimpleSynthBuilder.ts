import type { OscillatorModel } from "../lit3/WebComponents/OscillatorControl/OscillatorModel.js";
import {
  Guard,
  type IAudioNodeFactory,
  type ISynthBuilder,
  type ISynthesizer,
} from "./MakeIt.js";
import { MixerBus } from "./MixerBus.js";
import { SimpleSynth } from "./SimpleSynth.js";

export class SimpleSynthBuilder implements ISynthBuilder {
  private readonly oscillators: OscillatorModel[] = [];
  private mixerLevel = 1;

  public constructor(private readonly factory: IAudioNodeFactory) {}

  public addOscillator(model: OscillatorModel): ISynthBuilder {
    Guard.positive("frequency", model.frequency);
    Guard.gain("gain", model.gain);

    this.oscillators.push(model);
    return this;
  }

  public withMixerLevel(value: number): ISynthBuilder {
    Guard.gain("mixerLevel", value);
    this.mixerLevel = value;
    return this;
  }

  public build(): ISynthesizer {
    const normalizedOscillators = this.normalizeOscillators(this.oscillators);

    const mixer = new MixerBus(this.factory, {
      level: this.normalizeMixerLevel(this.mixerLevel, normalizedOscillators.length),
    });

    const oscillatorNodes: OscillatorNode[] = [];
    const gainNodes: GainNode[] = [];

    for (const oscillator of normalizedOscillators) {
      const oscillatorNode = this.factory.createOscillator({
        type: oscillator.type,
        frequency: oscillator.frequency,
        detune: oscillator.detune,
      });

      const gainNode = this.factory.createGain({
        gain: oscillator.gain,
      });

      oscillatorNode.connect(gainNode);
      gainNode.connect(mixer.input);

      oscillatorNodes.push(oscillatorNode);
      gainNodes.push(gainNode);
    }

    return new SimpleSynth(oscillatorNodes, gainNodes, mixer);
  }

  private normalizeOscillators(
    oscillators: readonly OscillatorModel[],
  ): readonly OscillatorModel[] {
    if (oscillators.length === 0) {
      return [
        {
          id: "osc-default",
          type: "sine",
          frequency: 440,
          detune: 0,
          gain: 0.25,
        },
      ];
    }

    const totalGain = oscillators.reduce((sum, item) => sum + item.gain, 0);

    if (totalGain <= 1) {
      return [...oscillators];
    }

    const scale = 1 / totalGain;

    return oscillators.map((item) => ({
      ...item,
      gain: item.gain * scale,
    }));
  }

  private normalizeMixerLevel(level: number, oscillatorCount: number): number {
    if (oscillatorCount <= 1) {
      return level;
    }

    return Math.min(level, 1 / Math.sqrt(oscillatorCount));
  }
}
