import { IStateCloner } from "../common/IStateCloner.js";
import { IScalarFieldBuffer2 } from "../buffers/IScalarFieldBuffer2.js";
import { DiffusionState2 } from "./DiffusionState2.js";


export class DiffusionStateCloner2 implements IStateCloner<DiffusionState2> {
  public constructor(
    private readonly buffer: IScalarFieldBuffer2
  ) { }

  public clone(state: DiffusionState2): DiffusionState2 {
    return new DiffusionState2(
      this.buffer.clone(state.current),
      this.buffer.clone(state.next)
    );
  }
}
