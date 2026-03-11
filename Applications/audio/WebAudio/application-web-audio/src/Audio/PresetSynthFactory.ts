// Applications/audio/WebAudio/application-web-audio/src/Audio/PresetSynthFactory.ts

import { SimpleSynthBuilder } from "./SimpleSynthBuilder.js";
import type { IAudioNodeFactory, ISynthesizer } from "./MakeIt.js";
import type { SynthesizerModel } from "../lit3/WebComponents/Synthesizer/SynthesizerModel.js";
import type { OscillatorModel } from "../lit3/WebComponents/OscillatorControl/OscillatorModel.js";

type VoiceConfig = {
  oscillator: {
    type: OscillatorType;
    frequency: number;
    detune: number;
  };
  gain: number;
};

type SimpleSynthConfig = {
  voices: VoiceConfig[];
  mixer: { level: number };
};

export interface ISynthesizerModelWithName extends SynthesizerModel {
  readonly name: string;
  readonly synth: ISynthesizer;
}

export class PresetSynthFactory {

  public constructor(private readonly nodeFactory: IAudioNodeFactory) {}

  public createDefaultModel(): ISynthesizerModelWithName {
    return this.createNamedPreset("Default", this.createDefaultConfig());
  }

  public createLeadModel(): ISynthesizerModelWithName {
    return this.createNamedPreset("Lead", this.createLeadConfig());
  }

  public createBassModel(): ISynthesizerModelWithName {
    return this.createNamedPreset("Bass", this.createBassConfig());
  }

  private createNamedPreset(
    name: string,
    config: SimpleSynthConfig
  ): ISynthesizerModelWithName {

    const synth = this.buildSynth(config);

    return {
      name,
      synth,
      oscillators: config.voices.map((voice, index): OscillatorModel => ({
        id: `${name.toLowerCase()}-osc-${index + 1}`,
        type: voice.oscillator.type,
        frequency: voice.oscillator.frequency,
        detune: voice.oscillator.detune,
        gain: voice.gain,
      })),
      mixerLevel: config.mixer.level,
    };
  }

  private buildSynth(config: SimpleSynthConfig): ISynthesizer {

    const builder = new SimpleSynthBuilder(this.nodeFactory)
      .withMixerLevel(config.mixer.level);

    for (const voice of config.voices) {

      builder.addOscillator({
        id: crypto.randomUUID(),
        type: voice.oscillator.type,
        frequency: voice.oscillator.frequency,
        detune: voice.oscillator.detune,
        gain: voice.gain,
      });

    }

    return builder.build();
  }

  private createDefaultConfig(): SimpleSynthConfig {
    return {
      voices: [
        {
          oscillator: { type: "sine", frequency: 440, detune: 0 },
          gain: 0.25,
        },
      ],
      mixer: { level: 1 },
    };
  }

  private createLeadConfig(): SimpleSynthConfig {
    return {
      voices: [
        {
          oscillator: { type: "sawtooth", frequency: 660, detune: 0 },
          gain: 0.15,
        },
        {
          oscillator: { type: "sawtooth", frequency: 660, detune: 8 },
          gain: 0.15,
        },
      ],
      mixer: { level: 1 },
    };
  }

  private createBassConfig(): SimpleSynthConfig {
    return {
      voices: [
        {
          oscillator: { type: "square", frequency: 110, detune: -4 },
          gain: 0.2,
        },
        {
          oscillator: { type: "sine", frequency: 55, detune: 0 },
          gain: 0.1,
        },
      ],
      mixer: { level: 1 },
    };
  }

}