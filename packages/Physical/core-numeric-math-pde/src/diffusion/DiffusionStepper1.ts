import { NumericGuards } from "@monorepo/core-numeric-math";
 
import { IScalarFieldBuffer1 } from "../buffers/IScalarFieldBuffer1.js";
import { ILaplacianOperator1 } from "../operators/ILaplacianOperator1.js";
import { DiffusionState1 } from "./DiffusionState1.js";
import { DiffusionWorkspace1 } from "./DiffusionWorkspace1.js";
import { IPdeStepper } from "../common/IPdeStepper.js";

export class DiffusionStepper1 implements IPdeStepper<DiffusionState1, DiffusionWorkspace1> {
  public constructor(
    private readonly laplacianOperator: ILaplacianOperator1,
    private readonly fieldBuffer: IScalarFieldBuffer1,
    private readonly diffusivity: number
  ) {
    NumericGuards.ensurePositive(diffusivity, "diffusivity");
  }

  public step(state: DiffusionState1, workspace: DiffusionWorkspace1, timeStep: number): void {
    NumericGuards.ensurePositive(timeStep, "timeStep");

    this.laplacianOperator.apply(state.current, workspace.laplacian);

    const factor = this.diffusivity * timeStep;

    for (let i = 0; i < state.current.grid.size; i++) {
      const next = state.current.sample(i) +
        (factor * workspace.laplacian.sample(i));

      state.next.write(i, next);
    }

    this.fieldBuffer.swap(state.current, state.next);
  }
}
