import { IStateCloner } from "../common/IStateCloner.js";
import { IScalarFieldBuffer1 } from "../buffers/IScalarFieldBuffer1.js";
import { WaveState1 } from "./WaveState1.js";

// ============================================================
// STATE CLONERS
// ============================================================

export class WaveStateCloner1 implements IStateCloner<WaveState1> {
  public constructor(
    private readonly buffer: IScalarFieldBuffer1
  ) { }

  public clone(state: WaveState1): WaveState1 {
    return new WaveState1(
      this.buffer.clone(state.previous),
      this.buffer.clone(state.current),
      this.buffer.clone(state.next)
    );
  }
}
