import { IStateCloner } from "../common/IStateCloner.js";
import { IScalarFieldBuffer1 } from "../buffers/IScalarFieldBuffer1.js";
import { DiffusionState1 } from "./DiffusionState1.js";


export class DiffusionStateCloner1 implements IStateCloner<DiffusionState1> {
  public constructor(
    private readonly buffer: IScalarFieldBuffer1
  ) { }

  public clone(state: DiffusionState1): DiffusionState1 {
    return new DiffusionState1(
      this.buffer.clone(state.current),
      this.buffer.clone(state.next)
    );
  }
}
