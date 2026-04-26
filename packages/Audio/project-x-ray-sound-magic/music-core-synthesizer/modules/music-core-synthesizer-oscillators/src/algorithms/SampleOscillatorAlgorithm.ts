import type {
  AudioSampleValue,
  ISampleOscillatorDefinition,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

import { OscillatorMath } from "../math/index.js";
import type { ISampleBufferProvider } from "../providers/index.js";
import type { IOscillatorAlgorithm } from "./IOscillatorAlgorithm.js";

export class SampleOscillatorAlgorithm
  implements IOscillatorAlgorithm<ISampleOscillatorDefinition> {
  public constructor(
    private readonly sampleBufferProvider: ISampleBufferProvider,
  ) {}

  public sample(
    definition: ISampleOscillatorDefinition,
    phase01: number,
  ): AudioSampleValue {
    const buffer = this.sampleBufferProvider.get(definition.sampleId);
    const position = OscillatorMath.wrap01(phase01) * Math.max(0, buffer.length - 1);

    return OscillatorMath.clampBipolar(buffer.sample(position));
  }
}
