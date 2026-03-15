import { IStateCloner } from "../common/IStateCloner.js";
import { IScalarFieldBuffer3 } from "../buffers/IScalarFieldBuffer3.js";
import { DiffusionState3 } from "./DiffusionState3.js";

export class DiffusionStateCloner3 implements IStateCloner<DiffusionState3> {
  public constructor(
    private readonly buffer: IScalarFieldBuffer3
  ) { }

  public clone(state: DiffusionState3): DiffusionState3 {
    return new DiffusionState3(
      this.buffer.clone(state.current),
      this.buffer.clone(state.next)
    );
  }
}
