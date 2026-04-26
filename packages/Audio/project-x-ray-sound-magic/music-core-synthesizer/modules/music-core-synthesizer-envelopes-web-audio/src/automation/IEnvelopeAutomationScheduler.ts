import type {
  EnvelopeDefinition,
  IEnvelopeGateOffRequest,
  IEnvelopeGateOnRequest,
} from "@monorepo/music-core-synthesizer-envelopes-contracts";

import type { IWebAudioAudioParamLike } from "../ports/index.js";

export interface IEnvelopeAutomationScheduler {
  scheduleGateOn(
    definition: EnvelopeDefinition,
    parameter: IWebAudioAudioParamLike,
    request: IEnvelopeGateOnRequest,
  ): void;

  scheduleGateOff(
    definition: EnvelopeDefinition,
    parameter: IWebAudioAudioParamLike,
    request: IEnvelopeGateOffRequest,
  ): void;

  reset(
    parameter: IWebAudioAudioParamLike,
    timeSeconds: number,
  ): void;
}
