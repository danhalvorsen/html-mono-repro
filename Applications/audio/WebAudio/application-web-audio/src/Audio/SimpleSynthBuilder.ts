 
import type { IAudioNodeFactory, ISimpleSynthConfig, ISynthBuilder, ISynthesizer } from "./MakeIt";
import { MixerBus } from "./MixerBus";
import { SimpleSynth } from "./SimpleSynth";
 
// ============================================================
// Builder
// ============================================================

export class SimpleSynthBuilder implements ISynthBuilder {

  private config: ISimpleSynthConfig = {
    oscillator: {
      type: "sine",
      frequency: 440,
      detune: 0
    },
    voiceGain: {
      gain: 0.25
    },
    mixer: {
      level: 1
    }
  };

  public constructor(private readonly factory: IAudioNodeFactory) { }

  public withOscillatorType(type: OscillatorType): ISynthBuilder {

    this.config = {
      ...this.config,
      oscillator: { ...this.config.oscillator, type }
    };

    return this;
  }

  public withFrequency(value: number): ISynthBuilder {

    this.config = {
      ...this.config,
      oscillator: { ...this.config.oscillator, frequency: value }
    };

    return this;
  }

  public withDetune(value: number): ISynthBuilder {

    this.config = {
      ...this.config,
      oscillator: { ...this.config.oscillator, detune: value }
    };

    return this;
  }

  public withVoiceGain(value: number): ISynthBuilder {

    this.config = {
      ...this.config,
      voiceGain: { gain: value }
    };

    return this;
  }

  public withMixerLevel(value: number): ISynthBuilder {

    this.config = {
      ...this.config,
      mixer: { level: value }
    };

    return this;
  }

  public build(): ISynthesizer {

    const osc = this.factory.createOscillator(this.config.oscillator);
    const gain = this.factory.createGain(this.config.voiceGain);
    const mixer = new MixerBus(this.factory, this.config.mixer);

    return new SimpleSynth(osc, gain, mixer);
  }
}
