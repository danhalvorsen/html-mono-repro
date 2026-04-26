// FILE: src/algorithms/OscillatorAlgorithmFactory.ts

import {
  OscillatorKind,
  type OscillatorDefinition,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

import type {
  ISampleBufferProvider,
  IWavetableProvider,
} from "../providers/index.js";
import { BasicOscillatorAlgorithm } from "./BasicOscillatorAlgorithm.js";
import type { IOscillatorAlgorithm } from "./IOscillatorAlgorithm.js";
import type { IOscillatorAlgorithmFactory } from "./IOscillatorAlgorithmFactory.js";
import { PulseOscillatorAlgorithm } from "./PulseOscillatorAlgorithm.js";
import { SampleOscillatorAlgorithm } from "./SampleOscillatorAlgorithm.js";
import { WavetableOscillatorAlgorithm } from "./WavetableOscillatorAlgorithm.js";

export class OscillatorAlgorithmFactory implements IOscillatorAlgorithmFactory {
  public constructor(
    private readonly wavetableProvider: IWavetableProvider,
    private readonly sampleBufferProvider: ISampleBufferProvider,
  ) {}

  public create(definition: OscillatorDefinition): IOscillatorAlgorithm {
    switch (definition.kind) {
      case OscillatorKind.Basic:
        return new BasicOscillatorAlgorithm();

      case OscillatorKind.Pulse:
        return new PulseOscillatorAlgorithm();

      case OscillatorKind.Wavetable:
        return new WavetableOscillatorAlgorithm(this.wavetableProvider);

      case OscillatorKind.Sample:
        return new SampleOscillatorAlgorithm(this.sampleBufferProvider);
    }

    throw new Error("Unsupported oscillator definition kind.");
  }
}