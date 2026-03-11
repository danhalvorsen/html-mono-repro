// Applications/audio/WebAudio/application-web-audio/src/Audio/SimpleSynthBuilder.ts
// BREAKING CHANGES ONLY

import { Guard, type IAudioNodeFactory, type ISynthBuilder, type ISynthesizer, type IVoiceConfig } from "./MakeIt";
import { MixerBus } from "./MixerBus";
import { SimpleSynth } from "./SimpleSynth";

export class SimpleSynthBuilder implements ISynthBuilder {
  private readonly voices: IVoiceConfig[] = [
    {
      oscillator: {
        type: "sine",
        frequency: 440,
        detune: 0,
      },
      gain: 0.25,
    },
  ];

  private mixerLevel = 1;

  public constructor(private readonly factory: IAudioNodeFactory) {}

  public addOscillator(
    type: OscillatorType,
    frequency: number,
    detune = 0,
    gain = 0.25,
  ): ISynthBuilder {
    Guard.positive("frequency", frequency);
    Guard.gain("gain", gain);

    this.voices.push({
      oscillator: {
        type,
        frequency,
        detune,
      },
      gain,
    });

    return this;
  }

  public withMixerLevel(value: number): ISynthBuilder {
    Guard.gain("mixerLevel", value);
    this.mixerLevel = value;
    return this;
  }

  public build(): ISynthesizer {
    const normalizedVoices = this.normalizeVoices(this.voices);
    const normalizedMixerLevel = this.normalizeMixerLevel(
      this.mixerLevel,
      normalizedVoices.length,
    );

    const mixer = new MixerBus(this.factory, {
      level: normalizedMixerLevel,
    });

    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    for (const voice of normalizedVoices) {
      const oscillator = this.factory.createOscillator(voice.oscillator);
      const gain = this.factory.createGain({ gain: voice.gain });

      oscillator.connect(gain);
      gain.connect(mixer.input);

      oscillators.push(oscillator);
      gains.push(gain);
    }

    return new SimpleSynth(oscillators, gains, mixer);
  }

  private normalizeVoices(voices: readonly IVoiceConfig[]): readonly IVoiceConfig[] {
    const totalGain = voices.reduce((sum, voice) => sum + voice.gain, 0);

    if (totalGain <= 1) {
      return [...voices];
    }

    const scale = 1 / totalGain;

    return voices.map((voice) => ({
      oscillator: voice.oscillator,
      gain: voice.gain * scale,
    }));
  }

  private normalizeMixerLevel(level: number, voiceCount: number): number {
    if (voiceCount <= 1) {
      return level;
    }

    const equalPowerScale = 1 / Math.sqrt(voiceCount);
    return Math.min(level, equalPowerScale);
  }
}