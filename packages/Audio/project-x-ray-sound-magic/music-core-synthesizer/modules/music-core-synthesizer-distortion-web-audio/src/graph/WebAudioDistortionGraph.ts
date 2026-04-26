import {
  DistortionDefinitionValidator,
  DistortionKind,
  type DistortionDefinition,
} from "@monorepo/music-core-synthesizer-distortion-contracts";

import type {
  IWebAudioConnectable,
  IWebAudioContextLike,
  IWebAudioDistortionGraph,
  IWebAudioGainNodeLike,
  IWebAudioWaveShaperNodeLike,
} from "../ports/index.js";
import type { IWaveShaperCurveFactory } from "../curves/index.js";

export class WebAudioDistortionGraph implements IWebAudioDistortionGraph {
  private currentDefinition: DistortionDefinition;

  public readonly inputNode: IWebAudioGainNodeLike;
  public readonly outputNode: IWebAudioGainNodeLike;

  private readonly dryGainNode: IWebAudioGainNodeLike;
  private readonly wetInputGainNode: IWebAudioGainNodeLike;
  private readonly wetOutputGainNode: IWebAudioGainNodeLike;
  private readonly waveShaperNode: IWebAudioWaveShaperNodeLike;

  public constructor(
    private readonly context: IWebAudioContextLike,
    definition: DistortionDefinition,
    private readonly definitionValidator: DistortionDefinitionValidator,
    private readonly curveFactory: IWaveShaperCurveFactory,
  ) {
    this.inputNode = this.context.createGain();
    this.dryGainNode = this.context.createGain();
    this.wetInputGainNode = this.context.createGain();
    this.waveShaperNode = this.context.createWaveShaper();
    this.wetOutputGainNode = this.context.createGain();
    this.outputNode = this.context.createGain();

    this.inputNode.connect(this.dryGainNode);
    this.dryGainNode.connect(this.outputNode);

    this.inputNode.connect(this.wetInputGainNode);
    this.wetInputGainNode.connect(this.waveShaperNode);
    this.waveShaperNode.connect(this.wetOutputGainNode);
    this.wetOutputGainNode.connect(this.outputNode);

    this.waveShaperNode.oversample = "4x";

    this.currentDefinition = definition;
    this.update(definition);
  }

  public get definition(): DistortionDefinition {
    return this.currentDefinition;
  }

  public update(definition: DistortionDefinition): void {
    this.definitionValidator.validate(definition);

    this.currentDefinition = definition;
    this.waveShaperNode.curve = this.curveFactory.create(definition);

    if (definition.kind === DistortionKind.Bypass) {
      this.dryGainNode.gain.value = 1;
      this.wetInputGainNode.gain.value = 1;
      this.wetOutputGainNode.gain.value = 0;
      this.outputNode.gain.value = 1;
      return;
    }

    this.dryGainNode.gain.value = 1 - definition.mix;
    this.wetInputGainNode.gain.value = definition.inputGain;
    this.wetOutputGainNode.gain.value = definition.outputGain * definition.mix;
    this.outputNode.gain.value = 1;
  }

  public connect(destination: IWebAudioConnectable): void {
    this.outputNode.connect(destination);
  }

  public disconnect(): void {
    this.outputNode.disconnect();
  }
}
