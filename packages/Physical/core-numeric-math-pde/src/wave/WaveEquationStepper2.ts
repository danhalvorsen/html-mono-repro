import { NumericGuards } from "@monorepo/core-numeric-math";
 
import { IScalarFieldBuffer2 } from "../buffers/IScalarFieldBuffer2.js";
import { ILaplacianOperator2 } from "../operators/ILaplacianOperator2.js";
import { WaveState2 } from "./WaveState2.js";
import { WaveWorkspace2 } from "./WaveWorkspace2.js";
import { IPdeStepper } from "../common/IPdeStepper.js";

export class WaveEquationStepper2 implements IPdeStepper<WaveState2, WaveWorkspace2> {
  public constructor(
    private readonly laplacianOperator: ILaplacianOperator2,
    private readonly fieldBuffer: IScalarFieldBuffer2,
    private readonly waveSpeed: number
  ) {
    NumericGuards.ensurePositive(waveSpeed, "waveSpeed");
  }

  public step(state: WaveState2, workspace: WaveWorkspace2, timeStep: number): void {
    NumericGuards.ensurePositive(timeStep, "timeStep");

    this.laplacianOperator.apply(state.current, workspace.laplacian);

    const factor = this.waveSpeed * this.waveSpeed * timeStep * timeStep;

    for (let j = 0; j < state.current.grid.height; j++) {
      for (let i = 0; i < state.current.grid.width; i++) {
        const next = (2 * state.current.sample(i, j)) -
          state.previous.sample(i, j) +
          (factor * workspace.laplacian.sample(i, j));

        state.next.write(i, j, next);
      }
    }

    this.fieldBuffer.swap(state.previous, state.current);
    this.fieldBuffer.swap(state.current, state.next);
  }
}
