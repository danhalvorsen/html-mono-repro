// src/calculator/calculator.cqrs.names.ts
export const CalculatorMessageName = {
  Digit: "calc:Digit",
  Operator: "calc:Operator",
  Clear: "calc:Clear",
  Equal: "calc:Equal",

  GetDisplay: "calc:GetDisplay",
  GetState: "calc:GetState",
} as const;

export type CalculatorMessageName =
  typeof CalculatorMessageName[keyof typeof CalculatorMessageName];