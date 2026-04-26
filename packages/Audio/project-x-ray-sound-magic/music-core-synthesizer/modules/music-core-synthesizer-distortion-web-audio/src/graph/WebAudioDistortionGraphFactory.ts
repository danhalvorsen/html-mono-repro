import {
  DistortionDefinitionValidator,
  type DistortionDefinition,
} from "@monorepo/music-core-synthesizer-distortion-contracts";

import {
  WaveShaperCurveFactory,
  type IWaveShaperCurveFactory,
} from "../curves/index.js";
import type {
  IWebAudioContextLike,
  IWebAudioDistortionGraph,
  IWebAudioDistortionGraphFactory,
} from "../ports/index.js";
import { WebAudioDistortionGraph } from "./WebAudioDistortionGraph.js";

export class WebAudioDistortionGraphFactory implements IWebAudioDistortionGraphFactory {
  public constructor(
    private readonly context: IWebAudioContextLike,
    private readonly definitionValidator: DistortionDefinitionValidator,
    private readonly curveFactory: IWaveShaperCurveFactory,
  ) {}

  public static createDefault(
    context: IWebAudioContextLike,
  ): WebAudioDistortionGraphFactory {
    return new WebAudioDistortionGraphFactory(
      context,
      DistortionDefinitionValidator.createDefault(),
      new WaveShaperCurveFactory(),
    );
  }

  public create(definition: DistortionDefinition): IWebAudioDistortionGraph {
    return new WebAudioDistortionGraph(
      this.context,
      definition,
      this.definitionValidator,
      this.curveFactory,
    );
  }
}
