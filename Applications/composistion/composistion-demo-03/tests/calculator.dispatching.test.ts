// tests/calculator.dispatching.test.ts
import { describe, it } from "vitest";
import { State } from "../src/calculator/calculator.types.js";
import { CalculatorFixture } from "./fixtures/CalculatorFixture.js";

describe("calculator.dispatching (fixture)", () => {
  const setup = () => {
    const fx = new CalculatorFixture();
    const { calc } = fx.createSut();
    return { fx, calc };
  };

  it("Digit(1) -> display '1', state EnteringNumber", async () => {
    const { fx, calc } = setup();

    await fx.Dispatch(calc, fx.Digit("1"));

    fx.Expect(calc, { display: "1", state: State.EnteringNumber });
  });

  it("Digit(1), Digit(2) -> display '12'", async () => {
    const { fx, calc } = setup();

    await fx.DispatchMany(calc, [fx.Digit("1"), fx.Digit("2")]);

    fx.Expect(calc, { display: "12", state: State.EnteringNumber });
  });

  it("Digit(9), CR -> display '', state EnteringNumber", async () => {
    const { fx, calc } = setup();

    await fx.DispatchMany(calc, [fx.Digit("9"), fx.CmdClear()]);

    fx.Expect(calc, { display: "", state: State.EnteringNumber });
  });

  it("Digit(7), Operator(+) -> state OperatorPressed (display stays)", async () => {
    const { fx, calc } = setup();

    await fx.DispatchMany(calc, [fx.Digit("7"), fx.Operand("+")]);

    fx.Expect(calc, { display: "7", state: State.OperatorPressed });
  });

  it("Digit(7), Operator(+), Operator(*) -> state Error", async () => {
    const { fx, calc } = setup();

    await fx.DispatchMany(calc, [fx.Digit("7"), fx.Operand("+"), fx.Operand("*")]);

    fx.Expect(calc, { state: State.Error });
  });

  it("Digit(7), Operator(+), Equals -> state Error", async () => {
    const { fx, calc } = setup();

    await fx.DispatchMany(calc, [fx.Digit("7"), fx.Operand("+"), fx.CmdEqual()]);

    fx.Expect(calc, { state: State.Error });
  });

  it("Error, CR -> back to EnteringNumber + clears display", async () => {
    const { fx, calc } = setup();

    await fx.DispatchMany(calc, [fx.Digit("7"), fx.Operand("+"), fx.CmdEqual()]);
    fx.Expect(calc, { state: State.Error });

    await fx.Dispatch(calc, fx.CmdClear());

    fx.Expect(calc, { display: "", state: State.EnteringNumber });
  });

  it("Digit(5), Operator(+), Digit(5), Equals -> display '10'", async () => {
    const { fx, calc } = setup();

    await fx.DispatchMany(calc, [fx.Digit("5"), fx.Operand("+"), fx.Digit("5"), fx.CmdEqual()]);

    fx.Expect(calc, { display: "10", state: State.EnteringNumber });
  });
  
});