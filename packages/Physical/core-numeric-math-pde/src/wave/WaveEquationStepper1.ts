import { NumericGuards } from "@monorepo/core-numeric-math";
 
import { IScalarFieldBuffer1 } from "../buffers/IScalarFieldBuffer1.js";
import { ILaplacianOperator1 } from "../operators/ILaplacianOperator1.js";
import { WaveState1 } from "./WaveState1.js";
import { WaveWorkspace1 } from "./WaveWorkspace1.js";
import { IPdeStepper } from "../common/IPdeStepper.js";

// ============================================================
// STEPPER IMPLEMENTATIONS
// ============================================================

export class WaveEquationStepper1 implements IPdeStepper<WaveState1, WaveWorkspace1> {
  public constructor(
    private readonly laplacianOperator: ILaplacianOperator1,
    private readonly fieldBuffer: IScalarFieldBuffer1,
    private readonly waveSpeed: number
  ) {
    NumericGuards.ensurePositive(waveSpeed, "waveSpeed");
  }

  public step(state: WaveState1, workspace: WaveWorkspace1, timeStep: number): void {
    NumericGuards.ensurePositive(timeStep, "timeStep");

    this.laplacianOperator.apply(state.current, workspace.laplacian);

    const factor = this.waveSpeed * this.waveSpeed * timeStep * timeStep;

    for (let i = 0; i < state.current.grid.size; i++) {
      const next = (2 * state.current.sample(i)) -
        state.previous.sample(i) +
        (factor * workspace.laplacian.sample(i));

      state.next.write(i, next);
    }

    this.fieldBuffer.swap(state.previous, state.current);
    this.fieldBuffer.swap(state.current, state.next);
  }
}
