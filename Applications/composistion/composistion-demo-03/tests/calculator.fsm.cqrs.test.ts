// tests/calculator.fsm.cqrs.test.ts
// Extended: arithmetic + divide-by-zero + equals-without-op
// Naming convention: "Sequence -> expected display/state"

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

/* ============================= Envelope builders ============================= */

const digitCmd = (digit: Digit): CalculatorCommand => ({
  json: JSON.stringify({ name: CalculatorMessageName.Digit, digit }),
});

const operatorCmd = (op: Operator): CalculatorCommand => ({
  json: JSON.stringify({ name: CalculatorMessageName.Operator, op }),
});

const clearCmd = (): CalculatorCommand => ({
  json: JSON.stringify({ name: CalculatorMessageName.Clear }),
});

const equalCmd = (): CalculatorCommand => ({
  json: JSON.stringify({ name: CalculatorMessageName.Equal }),
});

const getDisplayQry = (): GetDisplayQry => ({
  json: JSON.stringify({ name: CalculatorMessageName.GetDisplay }),
});

const getStateQry = (): GetStateQry => ({
  json: JSON.stringify({ name: CalculatorMessageName.GetState }),
});

describe("calculator.fsm via cqrs", () => {
  const setup = () => {
    const fx = new CalculatorFixture();
    const { calc } = fx.createSut();
    const cqrs = new CalculatorCqrs(calc);
    return { cqrs };
  };

  const executeMany = async (
    cqrs: CalculatorCqrs,
    commands: readonly CalculatorCommand[],
  ) => {
    for (const command of commands) {
      const result = await cqrs.execute(command as any);
      expect(result.isOk()).toBe(true);
    }
  };

  const expectDisplayAndState = async (
    cqrs: CalculatorCqrs,
    expected: { display: string; state: State },
  ) => {
    const displayResult = await cqrs.query(getDisplayQry() as any);
    expect(displayResult.isOk()).toBe(true);
    expect(displayResult.unwrap()).toBe(expected.display);

    const stateResult = await cqrs.query(getStateQry() as any);
    expect(stateResult.isOk()).toBe(true);
    expect(stateResult.unwrap()).toBe(expected.state);
  };

  it("Digit(1) -> display '1', state EnteringNumber", async () => {
    const { cqrs } = setup();

    await executeMany(cqrs, [digitCmd("1")]);

    await expectDisplayAndState(cqrs, {
      display: "1",
      state: State.EnteringNumber,
    });
  });

  it("Digit(1), Digit(2) -> display '12', state EnteringNumber", async () => {
    const { cqrs } = setup();

    await executeMany(cqrs, [digitCmd("1"), digitCmd("2")]);

    await expectDisplayAndState(cqrs, {
      display: "12",
      state: State.EnteringNumber,
    });
  });

  it("Digit(9), CR -> display '', state EnteringNumber", async () => {
    const { cqrs } = setup();

    await executeMany(cqrs, [digitCmd("9"), clearCmd()]);

    await expectDisplayAndState(cqrs, {
      display: "",
      state: State.EnteringNumber,
    });
  });

  it("Digit(7), Operator(+) -> display '7', state OperatorPressed", async () => {
    const { cqrs } = setup();

    await executeMany(cqrs, [digitCmd("7"), operatorCmd("+")]);

    await expectDisplayAndState(cqrs, {
      display: "7",
      state: State.OperatorPressed,
    });
  });

  it("Digit(7), Operator(+), Operator(*) -> display '7', state Error", async () => {
    const { cqrs } = setup();

    await executeMany(cqrs, [digitCmd("7"), operatorCmd("+"), operatorCmd("*")]);

    await expectDisplayAndState(cqrs, {
      display: "7",
      state: State.Error,
    });
  });

  it("Digit(7), Operator(+), Equals -> display '7', state Error", async () => {
    const { cqrs } = setup();

    await executeMany(cqrs, [digitCmd("7"), operatorCmd("+"), equalCmd()]);

    await expectDisplayAndState(cqrs, {
      display: "7",
      state: State.Error,
    });
  });

  it("Error, CR -> display '', state EnteringNumber", async () => {
    const { cqrs } = setup();

    await executeMany(cqrs, [digitCmd("7"), operatorCmd("+"), equalCmd()]);
    await expectDisplayAndState(cqrs, { display: "7", state: State.Error });

    await executeMany(cqrs, [clearCmd()]);

    await expectDisplayAndState(cqrs, {
      display: "",
      state: State.EnteringNumber,
    });
  });

  /* ============================= Arithmetic extensions ============================= */

  it("Digit(5), Operator(+), Digit(5), Equals -> display '10', state EnteringNumber", async () => {
    const { cqrs } = setup();

    await executeMany(cqrs, [digitCmd("5"), operatorCmd("+"), digitCmd("5"), equalCmd()]);

    await expectDisplayAndState(cqrs, {
      display: "10",
      state: State.EnteringNumber,
    });
  });

  it("Digit(5), Operator(-), Digit(3), Equals -> display '2', state EnteringNumber", async () => {
    const { cqrs } = setup();

    await executeMany(cqrs, [digitCmd("5"), operatorCmd("-"), digitCmd("3"), equalCmd()]);

    await expectDisplayAndState(cqrs, {
      display: "2",
      state: State.EnteringNumber,
    });
  });

  it("Digit(6), Operator(*), Digit(7), Equals -> display '42', state EnteringNumber", async () => {
    const { cqrs } = setup();

    await executeMany(cqrs, [digitCmd("6"), operatorCmd("*"), digitCmd("7"), equalCmd()]);

    await expectDisplayAndState(cqrs, {
      display: "42",
      state: State.EnteringNumber,
    });
  });

  it("Digit(8), Operator(/), Digit(2), Equals -> display '4', state EnteringNumber", async () => {
    const { cqrs } = setup();

    await executeMany(cqrs, [digitCmd("8"), operatorCmd("/"), digitCmd("2"), equalCmd()]);

    await expectDisplayAndState(cqrs, {
      display: "4",
      state: State.EnteringNumber,
    });
  });

  it("Digit(5), Operator(/), Digit(0), Equals -> display 'NaN', state EnteringNumber", async () => {
    const { cqrs } = setup();

    await executeMany(cqrs, [digitCmd("5"), operatorCmd("/"), digitCmd("0"), equalCmd()]);

    await expectDisplayAndState(cqrs, {
      display: "NaN",
      state: State.EnteringNumber,
    });
  });

  it("Digit(9), Equals -> display '9', state EnteringNumber", async () => {
    const { cqrs } = setup();

    await executeMany(cqrs, [digitCmd("9"), equalCmd()]);

    await expectDisplayAndState(cqrs, {
      display: "9",
      state: State.EnteringNumber,
    });
  });
});