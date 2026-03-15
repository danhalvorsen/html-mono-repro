import { IStateCloner } from "../common/IStateCloner.js";
import { IScalarFieldBuffer3 } from "../buffers/IScalarFieldBuffer3.js";
import { WaveState3 } from "./WaveState3.js";


export class WaveStateCloner3 implements IStateCloner<WaveState3> {
  public constructor(
    private readonly buffer: IScalarFieldBuffer3
  ) { }

  public clone(state: WaveState3): WaveState3 {
    return new WaveState3(
      this.buffer.clone(state.previous),
      this.buffer.clone(state.current),
      this.buffer.clone(state.next)
    );
  }
}
