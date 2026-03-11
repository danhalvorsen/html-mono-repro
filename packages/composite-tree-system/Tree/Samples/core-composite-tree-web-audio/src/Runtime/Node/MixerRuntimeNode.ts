
import { WebAudioRuntimeNodeBase } from "./WebAudioRuntimeNodeBase.js";
export class MixerRuntimeNode extends WebAudioRuntimeNodeBase {
  public constructor(private readonly mixerNode: GainNode) {
    super(mixerNode, mixerNode);
  }
}