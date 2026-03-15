import { IStateCloner } from "../common/IStateCloner.js";
import { IScalarFieldBuffer2 } from "../buffers/IScalarFieldBuffer2.js";
import { WaveState2 } from "./WaveState2.js";


export class WaveStateCloner2 implements IStateCloner<WaveState2> {
  public constructor(
    private readonly buffer: IScalarFieldBuffer2
  ) { }

  public clone(state: WaveState2): WaveState2 {
    return new WaveState2(
      this.buffer.clone(state.previous),
      this.buffer.clone(state.current),
      this.buffer.clone(state.next)
    );
  }
}
