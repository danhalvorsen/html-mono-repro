 
import { IScalarFieldBuffer3 } from "../buffers/IScalarFieldBuffer3.js";
import { IPdeStepper } from "../common/IPdeStepper.js";
import { ILaplacianOperator3 } from "../operators/ILaplacianOperator3.js";
import { NumberGuards } from "../guards/NumberGuards.js";
import { WaveState3 } from "./WaveState3.js";
import { WaveWorkspace3 } from "./WaveWorkspace3.js";

export class WaveEquationStepper3 implements IPdeStepper<WaveState3, WaveWorkspace3> {
  public constructor(
    private readonly laplacianOperator: ILaplacianOperator3,
    private readonly fieldBuffer: IScalarFieldBuffer3,
    private readonly waveSpeed: number
  ) {
    NumberGuards.ensurePositive(waveSpeed, "waveSpeed");
  }

  public step(state: WaveState3, workspace: WaveWorkspace3, timeStep: number): void {
    NumberGuards.ensurePositive(timeStep, "timeStep");

    this.laplacianOperator.apply(state.current, workspace.laplacian);

    const factor = this.waveSpeed * this.waveSpeed * timeStep * timeStep;

    for (let k = 0; k < state.current.grid.depth; k++) {
      for (let j = 0; j < state.current.grid.height; j++) {
        for (let i = 0; i < state.current.grid.width; i++) {
          const next = (2 * state.current.sample(i, j, k)) -
            state.previous.sample(i, j, k) +
            (factor * workspace.laplacian.sample(i, j, k));

          state.next.write(i, j, k, next);
        }
      }
    }

    this.fieldBuffer.swap(state.previous, state.current);
    this.fieldBuffer.swap(state.current, state.next);
  }
}
