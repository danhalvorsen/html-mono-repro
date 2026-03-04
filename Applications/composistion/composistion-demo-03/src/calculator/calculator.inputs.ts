import { InputType } from "./calculator.types.js";
import type { CalculatorInputs } from "./calculator.types.js";

export const Inputs: CalculatorInputs = {
  digit: (d) => ({ type: InputType.Digit, payload: { d } }),
  op: (op) => ({ type: InputType.Operator, payload: { op } }),
  eq: () => ({ type: InputType.Equals, payload: undefined }),
  cr: () => ({ type: InputType.CR, payload: undefined }),
};