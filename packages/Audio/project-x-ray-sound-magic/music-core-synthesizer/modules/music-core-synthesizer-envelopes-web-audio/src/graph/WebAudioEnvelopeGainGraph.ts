// FILE: src/graph/WebAudioEnvelopeGainGraph.ts

import {
  EnvelopeDefinitionValidator,
  type EnvelopeDefinition,
  type IEnvelopeGateOffRequest,
  type IEnvelopeGateOnRequest,
} from "@monorepo/music-core-synthesizer-envelopes-contracts";

import {
  EnvelopeAutomationScheduler,
  WebAudioEnvelopeAutomation,
  type IEnvelopeAutomationScheduler,
} from "../automation/index.js";
import type {
  IWebAudioConnectable,
  IWebAudioContextLike,
  IWebAudioEnvelopeGainGraph,
  IWebAudioGainNodeLike,
} from "../ports/index.js";

export class WebAudioEnvelopeGainGraph implements IWebAudioEnvelopeGainGraph {
  private readonly automation: WebAudioEnvelopeAutomation;
  private readonly definitionValidator: EnvelopeDefinitionValidator;

  public readonly inputNode: IWebAudioGainNodeLike;
  public readonly outputNode: IWebAudioGainNodeLike;

  public constructor(
    context: IWebAudioContextLike,
    definition: EnvelopeDefinition,
    scheduler: IEnvelopeAutomationScheduler = EnvelopeAutomationScheduler.createDefault(),
    definitionValidator: EnvelopeDefinitionValidator = EnvelopeDefinitionValidator.createDefault(),
  ) {
    this.definitionValidator = definitionValidator;
    this.definitionValidator.validate(definition);

    this.inputNode = context.createGain();
    this.outputNode = this.inputNode;

    this.inputNode.gain.value = 0;

    this.automation = new WebAudioEnvelopeAutomation(
      definition,
      this.inputNode.gain,
      scheduler,
    );
  }

  public get definition(): EnvelopeDefinition {
    return this.automation.definition;
  }

  public update(definition: EnvelopeDefinition): void {
    this.definitionValidator.validate(definition);
    this.automation.update(definition);
  }

  public gateOn(request: IEnvelopeGateOnRequest): void {
    this.automation.gateOn(request);
  }

  public gateOff(request: IEnvelopeGateOffRequest): void {
    this.automation.gateOff(request);
  }

  public reset(timeSeconds: number): void {
    this.automation.reset(timeSeconds);
  }

  public connect(destination: IWebAudioConnectable): void {
    this.outputNode.connect(destination);
  }

  public disconnect(): void {
    this.outputNode.disconnect();
  }
}