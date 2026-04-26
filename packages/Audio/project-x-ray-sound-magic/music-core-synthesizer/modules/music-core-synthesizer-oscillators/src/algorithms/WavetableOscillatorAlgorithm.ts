import type {
  AudioSampleValue,
  IWavetableOscillatorDefinition,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

import { OscillatorMath } from "../math/index.js";
import type { IWavetableProvider } from "../providers/index.js";
import type { IOscillatorAlgorithm } from "./IOscillatorAlgorithm.js";

export class WavetableOscillatorAlgorithm
  implements IOscillatorAlgorithm<IWavetableOscillatorDefinition> {
  public constructor(
    private readonly wavetableProvider: IWavetableProvider,
  ) {}

  public sample(
    definition: IWavetableOscillatorDefinition,
    phase01: number,
  ): AudioSampleValue {
    return OscillatorMath.clampBipolar(
      this.wavetableProvider.get(definition.tableId).sample(
        OscillatorMath.wrap01(phase01),
      ),
    );
  }
}
