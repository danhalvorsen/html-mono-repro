// src/calculator/calculator.cqrs.messages.ts
import type { ICommand, IQuery } from "@monorepo/core-design-patterns";
import type { Digit, Operator, State } from "./calculator.types.js";
import { CalculatorMessageName } from "./calculator.cqrs.names.js";

/* ============================= Commands ============================= */

export type DigitCmd = ICommand<{ readonly digit: Digit }> & {
  readonly name: typeof CalculatorMessageName.Digit;
};

export type OperatorCmd = ICommand<{ readonly op: Operator }> & {
  readonly name: typeof CalculatorMessageName.Operator;
};

export type ClearCmd = ICommand<{}> & {
  readonly name: typeof CalculatorMessageName.Clear;
};

export type EqualCmd = ICommand<{}> & {
  readonly name: typeof CalculatorMessageName.Equal;
};

export type CalculatorCommand =
  | DigitCmd
  | OperatorCmd
  | ClearCmd
  | EqualCmd;

/* ============================= Queries ============================= */

export type GetDisplayQry = IQuery<{}> & {
  readonly name: typeof CalculatorMessageName.GetDisplay;
};

export type GetStateQry = IQuery<{}> & {
  readonly name: typeof CalculatorMessageName.GetState;
};

export type CalculatorQuery =
  | GetDisplayQry
  | GetStateQry;

export type CalculatorQueryResult<Q extends CalculatorQuery> =
  Q["name"] extends typeof CalculatorMessageName.GetDisplay ? string :
  Q["name"] extends typeof CalculatorMessageName.GetState ? State :
  never;