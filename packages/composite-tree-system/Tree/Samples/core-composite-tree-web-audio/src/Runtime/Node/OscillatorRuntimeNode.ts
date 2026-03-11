import { IStartableWebAudioRuntimeNode } from "./IStartableWebAudioRuntimeNode.js";
import { WebAudioRuntimeNodeBase } from "./WebAudioRuntimeNodeBase.js";
 
export class OscillatorRuntimeNode
  extends WebAudioRuntimeNodeBase
  implements IStartableWebAudioRuntimeNode {
  private hasStarted = false;
  private hasStopped = false;

  public constructor(private readonly oscillatorNode: OscillatorNode) {
    super(oscillatorNode, oscillatorNode);
  }

  public start(): void {
    if (this.hasStarted) {
      return;
    }

    this.oscillatorNode.start();
    this.hasStarted = true;
  }

  public stop(): void {
    if (!this.hasStarted || this.hasStopped) {
      return;
    }

    this.oscillatorNode.stop();
    this.hasStopped = true;
  }

  public override dispose(): void {
    this.stop();
    super.dispose();
  }
}