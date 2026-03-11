// Applications/audio/WebAudio/application-web-audio/src/Audio/PresetSynthFactory.ts

import { SimpleSynthBuilder } from "./SimpleSynthBuilder";
import type { ISynthFactory, IAudioNodeFactory, ISynthesizer } from "./MakeIt";

export class PresetSynthFactory implements ISynthFactory {
  public constructor(private readonly nodeFactory: IAudioNodeFactory) {}

  public createDefault(): ISynthesizer {
    return new SimpleSynthBuilder(this.nodeFactory)
      .addOscillator("sine", 440, 0, 0.25)
      .withMixerLevel(1)
      .build();
  }

  public createLead(): ISynthesizer {
    return new SimpleSynthBuilder(this.nodeFactory)
      .addOscillator("sawtooth", 660, 0, 0.15)
      .addOscillator("sawtooth", 660, 8, 0.15)
      .withMixerLevel(1)
      .build();
  }

  public createBass(): ISynthesizer {
    return new SimpleSynthBuilder(this.nodeFactory)
      .addOscillator("square", 110, -4, 0.2)
      .addOscillator("sine", 55, 0, 0.1)
      .withMixerLevel(1)
      .build();
  }
}