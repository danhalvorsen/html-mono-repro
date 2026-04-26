import type {
  IOscillator,
  IOscillatorFactory,
  OscillatorDefinition,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

import {
  OscillatorAlgorithmFactory,
  type IOscillatorAlgorithmFactory,
} from "../algorithms/index.js";
import {
  ThrowingSampleBufferProvider,
  ThrowingWavetableProvider,
  type ISampleBufferProvider,
  type IWavetableProvider,
} from "../providers/index.js";
import { OscillatorDefinitionValidator } from "../validation/index.js";
import { Oscillator } from "./Oscillator.js";

export interface IOscillatorFactoryDependencies {
  readonly definitionValidator: OscillatorDefinitionValidator;
  readonly algorithmFactory: IOscillatorAlgorithmFactory;
}

export interface IOscillatorFactoryProviderDependencies {
  readonly wavetableProvider: IWavetableProvider;
  readonly sampleBufferProvider: ISampleBufferProvider;
}

export class OscillatorFactory implements IOscillatorFactory {
  public constructor(
    private readonly dependencies: IOscillatorFactoryDependencies,
  ) {}

  public static createDefault(): OscillatorFactory {
    return OscillatorFactory.createWithProviders({
      wavetableProvider: new ThrowingWavetableProvider(),
      sampleBufferProvider: new ThrowingSampleBufferProvider(),
    });
  }

  public static createWithProviders(
    dependencies: IOscillatorFactoryProviderDependencies,
  ): OscillatorFactory {
    return new OscillatorFactory({
      definitionValidator: new OscillatorDefinitionValidator(),
      algorithmFactory: new OscillatorAlgorithmFactory(
        dependencies.wavetableProvider,
        dependencies.sampleBufferProvider,
      ),
    });
  }

  public create(definition: OscillatorDefinition): IOscillator {
    this.dependencies.definitionValidator.validate(definition);

    return new Oscillator(
      definition,
      this.dependencies.algorithmFactory.create(definition),
      this.dependencies.definitionValidator,
    );
  }
}
