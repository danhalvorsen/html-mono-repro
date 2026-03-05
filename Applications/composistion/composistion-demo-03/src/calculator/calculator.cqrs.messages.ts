// src/calculator/calculator.cqrs.messages.ts

import type { Digit, Operator, State } from "./calculator.types.js";
import { CalculatorMessageName } from "./calculator.cqrs.names.js";
import type { ICommand, ICommandBase, IQuery, IQueryBase } from "@monorepo/core-design-patterns-cqrs";

/* ============================= Command Messages ============================= */

export interface DigitCmdMsg extends ICommandBase {
  readonly name: typeof CalculatorMessageName.Digit;
  readonly digit: Digit;
}

export interface OperatorCmdMsg extends ICommandBase {
  readonly name: typeof CalculatorMessageName.Operator;
  readonly op: Operator;
}

export interface ClearCmdMsg extends ICommandBase {
  readonly name: typeof CalculatorMessageName.Clear;
}

export interface EqualCmdMsg extends ICommandBase {
  readonly name: typeof CalculatorMessageName.Equal;
}

/* ============================= Command Envelopes ============================= */

export type DigitCmd = ICommand<DigitCmdMsg>;
export type OperatorCmd = ICommand<OperatorCmdMsg>;
export type ClearCmd = ICommand<ClearCmdMsg>;
export type EqualCmd = ICommand<EqualCmdMsg>;

export type CalculatorCommand =
  | DigitCmd
  | OperatorCmd
  | ClearCmd
  | EqualCmd;

/* ============================= Query Messages ============================= */

export interface GetDisplayQryMsg extends IQueryBase {
  readonly name: typeof CalculatorMessageName.GetDisplay;
}

export interface GetStateQryMsg extends IQueryBase {
  readonly name: typeof CalculatorMessageName.GetState;
}

/* ============================= Query Envelopes ============================= */

export type GetDisplayQry = IQuery<GetDisplayQryMsg>;
export type GetStateQry = IQuery<GetStateQryMsg>;

export type CalculatorQuery =
  | GetDisplayQry
  | GetStateQry;

/* ============================= Query Results ============================= */

export type CalculatorQueryResult<Q extends CalculatorQuery> =
  Q extends IQuery<GetDisplayQryMsg> ? string :
  Q extends IQuery<GetStateQryMsg> ? State :
  never;