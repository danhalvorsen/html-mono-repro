import { WebAudioRuntimeNodeBase } from "./WebAudioRuntimeNodeBase.js";

export class GainRuntimeNode extends WebAudioRuntimeNodeBase {

  public constructor(private readonly gainNode: GainNode) {
    super(gainNode, gainNode);
  }

}