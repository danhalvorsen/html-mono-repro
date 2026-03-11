import { SimpleSynthBuilder } from "./SimpleSynthBuilder";
import type { ISynthFactory, IAudioNodeFactory, ISynthesizer } from "./MakeIt";

// ============================================================
// Preset factory (GOF Factory)
// ============================================================
export class PresetSynthFactory implements ISynthFactory {

  public constructor(private readonly nodeFactory: IAudioNodeFactory) { }

  public createDefault(): ISynthesizer {

    return new SimpleSynthBuilder(this.nodeFactory)
      .withOscillatorType("sine")
      .withFrequency(440)
      .withVoiceGain(0.25)
      .build();
  }

  public createLead(): ISynthesizer {

    return new SimpleSynthBuilder(this.nodeFactory)
      .withOscillatorType("sawtooth")
      .withFrequency(660)
      .withDetune(8)
      .withVoiceGain(0.15)
      .build();
  }

  public createBass(): ISynthesizer {

    return new SimpleSynthBuilder(this.nodeFactory)
      .withOscillatorType("square")
      .withFrequency(110)
      .withDetune(-4)
      .withVoiceGain(0.2)
      .build();
  }
}
