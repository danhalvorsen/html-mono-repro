import type {
  EnvelopeDefinition,
} from "@monorepo/music-core-synthesizer-envelopes-contracts";

import {
  EnvelopeAutomationScheduler,
  type IEnvelopeAutomationScheduler,
} from "../automation/index.js";
import type {
  IWebAudioContextLike,
  IWebAudioEnvelopeGainGraph,
  IWebAudioEnvelopeGainGraphFactory,
} from "../ports/index.js";
import { WebAudioEnvelopeGainGraph } from "./WebAudioEnvelopeGainGraph.js";

export class WebAudioEnvelopeGainGraphFactory
  implements IWebAudioEnvelopeGainGraphFactory {
  public constructor(
    private readonly context: IWebAudioContextLike,
    private readonly scheduler: IEnvelopeAutomationScheduler,
  ) {}

  public static createDefault(
    context: IWebAudioContextLike,
  ): WebAudioEnvelopeGainGraphFactory {
    return new WebAudioEnvelopeGainGraphFactory(
      context,
      EnvelopeAutomationScheduler.createDefault(),
    );
  }

  public create(definition: EnvelopeDefinition): IWebAudioEnvelopeGainGraph {
    return new WebAudioEnvelopeGainGraph(
      this.context,
      definition,
      this.scheduler,
    );
  }
}
