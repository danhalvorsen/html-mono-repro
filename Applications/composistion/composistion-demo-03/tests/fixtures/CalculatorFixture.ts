import { expect } from "vitest";
import { CalculatorFsm } from "../../src/calculator/calculator.fsm.js";
import { Calculator } from "../../src/calculator/calculator.js";
import { Inputs } from "../../src/calculator/calculator.inputs.js";
import { State } from "../../src/calculator/calculator.types.js";
import type { CalculatorInput, Digit, Operator } from "../../src/calculator/calculator.types.js";

export class CalculatorFixture {

  public createSut() {
    const def = new CalculatorFsm();
    const calc = new Calculator(def.definition);
    return { def, calc };
  }

  /* ============================= Domain helpers ============================= */

  public Digit(d: Digit): CalculatorInput {
    return Inputs.digit(d);
  }

  public Operand(op: Operator): CalculatorInput {
    return Inputs.op(op);
  }

  public CmdClear(): CalculatorInput {
    return Inputs.cr();
  }

  public CmdEqual(): CalculatorInput {
    return Inputs.eq();
  }

  public async Dispatch(calc: Calculator, input: CalculatorInput): Promise<void> {
    await calc.dispatch(input);
  }

  public async DispatchMany(calc: Calculator, inputs: readonly CalculatorInput[]): Promise<void> {
    for (const i of inputs) await calc.dispatch(i);
  }

  /* ============================= Assertions ============================= */

  public Expect(calc: Calculator, args: {
    readonly display?: string;
    readonly state?: typeof State[keyof typeof State];
  }): void {

    if (args.display !== undefined)
      expect(calc.display).toBe(args.display);

    if (args.state !== undefined)
      expect(calc.state).toBe(args.state);
  }
}