 
import { FsmBuilder, type FsmDefinition, type IInput  } from '@monorepo/core-fsm';

export type CalculatorState = "EnteringNumber" | "OperatorPressed" | "Error";

export type DigitInput = IInput<"Digit", { readonly d: string }>;
export type OperatorInput = IInput<"Operator", { readonly op: "+" | "-" | "*" | "/" }>;
export type EqualsInput = IInput<"Equals", {}>;
export type CrInput = IInput<"CR", {}>;

export type CalculatorInput = DigitInput | OperatorInput | EqualsInput | CrInput;

export class CalculatorFsmContract {
  public createDefinition(): FsmDefinition<CalculatorState, unknown, CalculatorInput, never> {
    return new FsmBuilder<CalculatorState, unknown, CalculatorInput, never>()
      .initial("EnteringNumber")

      // EnteringNumber
      .from("EnteringNumber").on("Digit").to("EnteringNumber")
      .from("EnteringNumber").on("Operator").to("OperatorPressed")
      .from("EnteringNumber").on("Equals").to("EnteringNumber")
      .from("EnteringNumber").on("CR").to("EnteringNumber")

      // OperatorPressed
      .from("OperatorPressed").on("Digit").to("EnteringNumber")
      .from("OperatorPressed").on("Operator").to("Error")
      .from("OperatorPressed").on("Equals").to("Error")
      .from("OperatorPressed").on("CR").to("EnteringNumber")

      // Error
      .from("Error").on("CR").to("EnteringNumber")

      .build();
  }
}