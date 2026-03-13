
import { IScalarFieldBuffer3 } from "../buffers/IScalarFieldBuffer3.js";
import { ILaplacianOperator3 } from "../operators/ILaplacianOperator3.js";
import { DiffusionWorkspace3 } from "./DiffusionWorkspace3.js";
import { DiffusionState3 } from "./DiffusionState3.js";
import { IPdeStepper } from "../common/IPdeStepper.js";
import { NumberGuards } from "../guards/NumberGuards.js";

export class DiffusionStepper3 implements IPdeStepper<DiffusionState3, DiffusionWorkspace3> {
  public constructor(
    private readonly laplacianOperator: ILaplacianOperator3,
    private readonly fieldBuffer: IScalarFieldBuffer3,
    private readonly diffusivity: number
  ) {
    NumberGuards.ensurePositive(diffusivity, "diffusivity");
  }

  public step(state: DiffusionState3, workspace: DiffusionWorkspace3, timeStep: number): void {
    NumberGuards.ensurePositive(timeStep, "timeStep");

    this.laplacianOperator.apply(state.current, workspace.laplacian);

    const factor = this.diffusivity * timeStep;

    for (let k = 0; k < state.current.grid.depth; k++) {
      for (let j = 0; j < state.current.grid.height; j++) {
        for (let i = 0; i < state.current.grid.width; i++) {
          const next = state.current.sample(i, j, k) +
            (factor * workspace.laplacian.sample(i, j, k));

          state.next.write(i, j, k, next);
        }
      }
    }

    this.fieldBuffer.swap(state.current, state.next);
  }
}
