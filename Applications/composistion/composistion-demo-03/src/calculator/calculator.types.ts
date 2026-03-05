import type { IInput } from "@monorepo/core-fsm";

/* ============================= State / InputType (single source of truth) ============================= */

export const State = {
  EnteringNumber: "EnteringNumber",
  OperatorPressed: "OperatorPressed",
  Error: "Error",
} as const;

export type State = typeof State[keyof typeof State];

export const InputType = {
  Digit: "Digit",
  Operator: "Operator",
  Equals: "Equals",
  CR: "CR",
} as const;

export type InputType = typeof InputType[keyof typeof InputType];

/* ============================= Domain ============================= */

export type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
export type Operator = "+" | "-" | "*" | "/";

/* ============================= Inputs (FSM alphabet) ============================= */

export type DigitInput = IInput<typeof InputType.Digit, { readonly d: Digit }>;
export type OperatorInput = IInput<typeof InputType.Operator, { readonly op: Operator }>;
export type EqualsInput = IInput<typeof InputType.Equals, undefined>;
export type CrInput = IInput<typeof InputType.CR, undefined>;

export type CalculatorInput =
  | DigitInput
  | OperatorInput
  | EqualsInput
  | CrInput;

/* ============================= Input factory contract ============================= */

export type CalculatorInputs = Readonly<{
  digit(d: Digit): DigitInput;
  op(op: Operator): OperatorInput;
  eq(): EqualsInput;
  cr(): CrInput;
}>;