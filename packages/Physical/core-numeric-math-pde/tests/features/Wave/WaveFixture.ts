// tests/features/wave/WaveFixture.ts

import {
  DefaultPdeSolver,
  DirichletScalarFieldSampler1,
  LaplacianOperator1,
  ScalarField1,
  ScalarFieldBuffer1,
  ScalarFieldFactory1,
  UniformGrid1,
  WaveEquationStepper1,
  WaveState1,
  WaveStateCloner1,
  WaveWorkspace1
} from '../../../src/index.js';

export class WaveFixture {
  public createImpulse1D(length = 5) {
    const grid = new UniformGrid1(length, 1, 0);

    const scalarFieldFactory = new ScalarFieldFactory1();
    const scalarFieldBuffer = new ScalarFieldBuffer1(scalarFieldFactory);
    const sampler = new DirichletScalarFieldSampler1(0);
    const laplacian = new LaplacianOperator1(sampler);

    const previous = new ScalarField1(grid, [0, 0, 0, 0, 0]);
    const current = new ScalarField1(grid, [0, 0, 1, 0, 0]);
    const next = new ScalarField1(grid, [0, 0, 0, 0, 0]);

    const state = new WaveState1(previous, current, next);
    const workspace = new WaveWorkspace1(scalarFieldFactory.create(grid));
    const stepper = new WaveEquationStepper1(laplacian, scalarFieldBuffer, 1);
    const stateCloner = new WaveStateCloner1(scalarFieldBuffer);
    const solver = new DefaultPdeSolver(stepper, stateCloner);

    return {
      grid,
      state,
      workspace,
      stepper,
      solver
    };
  }

  public read(field: { grid: UniformGrid1; sample(i: number): number }): number[] {
    const result: number[] = [];

    for (let i = 0; i < field.grid.size; i++) {
      result.push(field.sample(i));
    }

    return result;
  }
}