import type {
  IOscillator,
  IOscillatorFactory,
  OscillatorDefinition,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

import {
  ThrowingWebAudioSampleBufferProvider,
  ThrowingWebAudioWavetableProvider,
} from "../providers/index.js";
import type {
  IWebAudioContextLike,
  IWebAudioOscillatorGraph,
  IWebAudioOscillatorGraphFactory,
  IWebAudioSampleBufferProvider,
  IWebAudioWavetableProvider,
} from "../ports/index.js";
import { WebAudioOscillatorDefinitionValidator } from "../validation/index.js";
import { WebAudioOscillatorGraph } from "./WebAudioOscillatorGraph.js";

export interface IWebAudioOscillatorGraphFactoryDependencies {
  readonly context: IWebAudioContextLike;
  readonly definitionValidator: WebAudioOscillatorDefinitionValidator;
  readonly wavetableProvider: IWebAudioWavetableProvider;
  readonly sampleBufferProvider: IWebAudioSampleBufferProvider;
}

export class WebAudioOscillatorGraphFactory
  implements IWebAudioOscillatorGraphFactory, IOscillatorFactory {
  public constructor(
    private readonly dependencies: IWebAudioOscillatorGraphFactoryDependencies,
  ) {}

  public static createDefault(
    context: IWebAudioContextLike,
  ): WebAudioOscillatorGraphFactory {
    return new WebAudioOscillatorGraphFactory({
      context,
      definitionValidator: new WebAudioOscillatorDefinitionValidator(),
      wavetableProvider: new ThrowingWebAudioWavetableProvider(),
      sampleBufferProvider: new ThrowingWebAudioSampleBufferProvider(),
    });
  }

  public create(definition: OscillatorDefinition): IWebAudioOscillatorGraph & IOscillator {
    this.dependencies.definitionValidator.validate(definition);

    return new WebAudioOscillatorGraph(
      this.dependencies.context,
      definition,
      this.dependencies.definitionValidator,
      this.dependencies.wavetableProvider,
      this.dependencies.sampleBufferProvider,
    );
  }
}
