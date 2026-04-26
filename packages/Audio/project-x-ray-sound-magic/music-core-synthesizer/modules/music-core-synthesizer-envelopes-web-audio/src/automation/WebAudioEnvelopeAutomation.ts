import type {
  EnvelopeDefinition,
  IEnvelopeGateOffRequest,
  IEnvelopeGateOnRequest,
} from "@monorepo/music-core-synthesizer-envelopes-contracts";

import type {
  IWebAudioAudioParamLike,
  IWebAudioEnvelopeAutomation,
} from "../ports/index.js";
import type { IEnvelopeAutomationScheduler } from "./IEnvelopeAutomationScheduler.js";

export class WebAudioEnvelopeAutomation implements IWebAudioEnvelopeAutomation {
  private currentDefinition: EnvelopeDefinition;

  public constructor(
    definition: EnvelopeDefinition,
    private readonly targetParameter: IWebAudioAudioParamLike,
    private readonly scheduler: IEnvelopeAutomationScheduler,
  ) {
    this.currentDefinition = definition;
  }

  public get definition(): EnvelopeDefinition {
    return this.currentDefinition;
  }

  public update(definition: EnvelopeDefinition): void {
    this.currentDefinition = definition;
  }

  public gateOn(request: IEnvelopeGateOnRequest): void {
    this.scheduler.scheduleGateOn(
      this.currentDefinition,
      this.targetParameter,
      request,
    );
  }

  public gateOff(request: IEnvelopeGateOffRequest): void {
    this.scheduler.scheduleGateOff(
      this.currentDefinition,
      this.targetParameter,
      request,
    );
  }

  public reset(timeSeconds: number): void {
    this.scheduler.reset(this.targetParameter, timeSeconds);
  }
}
