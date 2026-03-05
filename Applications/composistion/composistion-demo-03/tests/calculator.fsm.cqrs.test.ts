import { describe, expect, it } from "vitest";

import { CalculatorCqrs } from "../src/calculator/calculator.cqrs.js";
import { CalculatorMessageName } from "../src/calculator/calculator.cqrs.names.js";
import type {
  CalculatorCommand,
  GetDisplayQry,
  GetStateQry,
} from "../src/calculator/calculator.cqrs.messages.js";
import { State } from "../src/calculator/calculator.types.js";
import type { Digit, Operator } from "../src/calculator/calculator.types.js";
import { CalculatorFixture } from "./fixtures/CalculatorFixture.js";

const digitCmd = (digit: Digit): CalculatorCommand => ({
  name: CalculatorMessageName.Digit,
  json: JSON.stringify({ digit }),
});

const operatorCmd = (op: Operator): CalculatorCommand => ({
  name: CalculatorMessageName.Operator,
  json: JSON.stringify({ op }),
});

const clearCmd = (): CalculatorCommand => ({
  name: CalculatorMessageName.Clear,
  json: JSON.stringify({}),
});

const equalCmd = (): CalculatorCommand => ({
  name: CalculatorMessageName.Equal,
  json: JSON.stringify({}),
});

const getDisplayQry = (): GetDisplayQry => ({
  name: CalculatorMessageName.GetDisplay,
  json: JSON.stringify({}),
});

const getStateQry = (): GetStateQry => ({
  name: CalculatorMessageName.GetState,
  json: JSON.stringify({}),
});

describe("calculator.fsm via cqrs", () => {
  const setup = () => {
    const fx = new CalculatorFixture();
    const { calc } = fx.createSut();
    const cqrs = new CalculatorCqrs(calc);
    return { cqrs };
  };

  const executeMany = async (cqrs: CalculatorCqrs, commands: readonly CalculatorCommand[]) => {
    for (const command of commands) {
      const result = await cqrs.execute(command);
      expect(result.isOk()).toBe(true);
    }
  };

  const expectDisplayAndState = async (
    cqrs: CalculatorCqrs,
    expected: { display: string; state: State },
  ) => {
    const displayResult = await cqrs.query(getDisplayQry());
    expect(displayResult.isOk()).toBe(true);
    expect(displayResult.unwrap()).toBe(expected.display);

    const stateResult = await cqrs.query(getStateQry());
    expect(stateResult.isOk()).toBe(true);
    expect(stateResult.unwrap()).toBe(expected.state);
  };

  it("Digit(1) -> display '1', state EnteringNumber", async () => {
    const { cqrs } = setup();

    await executeMany(cqrs, [digitCmd("1")]);

    await expectDisplayAndState(cqrs, { display: "1", state: State.EnteringNumber });
  });

  it("Digit(1), Digit(2) -> display '12', state EnteringNumber", async () => {
    const { cqrs } = setup();

    await executeMany(cqrs, [digitCmd("1"), digitCmd("2")]);

    await expectDisplayAndState(cqrs, { display: "12", state: State.EnteringNumber });
  });

  it("Digit(9), CR -> display '', state EnteringNumber", async () => {
    const { cqrs } = setup();

    await executeMany(cqrs, [digitCmd("9"), clearCmd()]);

    await expectDisplayAndState(cqrs, { display: "", state: State.EnteringNumber });
  });

  it("Digit(7), Operator(+) -> display '7', state OperatorPressed", async () => {
    const { cqrs } = setup();

    await executeMany(cqrs, [digitCmd("7"), operatorCmd("+")]);

    await expectDisplayAndState(cqrs, { display: "7", state: State.OperatorPressed });
  });

  it("Digit(7), Operator(+), Operator(*) -> state Error", async () => {
    const { cqrs } = setup();

    await executeMany(cqrs, [digitCmd("7"), operatorCmd("+"), operatorCmd("*")]);

    await expectDisplayAndState(cqrs, { display: "7", state: State.Error });
  });

  it("Digit(7), Operator(+), Equals -> state Error", async () => {
    const { cqrs } = setup();

    await executeMany(cqrs, [digitCmd("7"), operatorCmd("+"), equalCmd()]);

    await expectDisplayAndState(cqrs, { display: "7", state: State.Error });
  });

  it("Error, CR -> back to EnteringNumber and clears display", async () => {
    const { cqrs } = setup();

    await executeMany(cqrs, [digitCmd("7"), operatorCmd("+"), equalCmd()]);
    await expectDisplayAndState(cqrs, { display: "7", state: State.Error });

    await executeMany(cqrs, [clearCmd()]);

    await expectDisplayAndState(cqrs, { display: "", state: State.EnteringNumber });
  });
});
