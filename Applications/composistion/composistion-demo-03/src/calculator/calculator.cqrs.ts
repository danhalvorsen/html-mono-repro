// src/calculator/calculator.cqrs.ts
// Logging added without changing CQRS contracts

import {
  Err,
  type Result,
  type NonUndefined,
  Ok} from "@monorepo/core-design-patterns";

import { CommandHandler, QueryHandler, type ICommand, type ICommandBase, type IQuery, type IQueryBase } from "@monorepo/core-design-patterns-cqrs";

import type { Calculator } from "./calculator.js";

import { CalculatorMessageName } from "./calculator.cqrs.names.js";
import { Inputs } from "./calculator.inputs.js";
import type { Digit, Operator } from "./calculator.types.js";

import type {
  DigitCmdMsg,
  OperatorCmdMsg,
  ClearCmdMsg,
  EqualCmdMsg,
  GetDisplayQryMsg,
  GetStateQryMsg
} from "./calculator.cqrs.messages.js";

/* ============================= Errors ============================= */

export type CalculatorError =
  | { readonly kind: "UnknownCommand"; readonly name: string }
  | { readonly kind: "UnknownQuery"; readonly name: string }
  | { readonly kind: "ExecutionFailed"; readonly name: string; readonly error: unknown };

type CmdOk = null;

/* ============================= Logging ============================= */

function log(scope: string, msg: unknown): void {
  console.info(`[calculator-cqrs] ${scope}`, msg);
}

/* ============================= JSON helper ============================= */

function parseJson<T extends ICommandBase | IQueryBase>(json: string): T {
  return JSON.parse(json) as T;
}

/* ============================= Command handlers ============================= */

export class DigitCmdHandler
  extends CommandHandler<DigitCmdMsg, CmdOk, CalculatorError>
{
  constructor(private readonly calculator: Calculator) {
    super();
  }

  public async Handle(command: ICommand<DigitCmdMsg>): Promise<Result<CmdOk, CalculatorError>> {

    const msg = parseJson<DigitCmdMsg>(command.json);

    log("DigitCmd", msg);

    const digit: Digit = msg.digit;

    await this.calculator.dispatch(Inputs.digit(digit));

    return Ok(null);
  }
}

export class OperatorCmdHandler
  extends CommandHandler<OperatorCmdMsg, CmdOk, CalculatorError>
{
  constructor(private readonly calculator: Calculator) {
    super();
  }

  public async Handle(command: ICommand<OperatorCmdMsg>): Promise<Result<CmdOk, CalculatorError>> {

    const msg = parseJson<OperatorCmdMsg>(command.json);

    log("OperatorCmd", msg);

    const op: Operator = msg.op;

    await this.calculator.dispatch(Inputs.op(op));

    return Ok(null);
  }
}

export class ClearCmdHandler
  extends CommandHandler<ClearCmdMsg, CmdOk, CalculatorError>
{
  constructor(private readonly calculator: Calculator) {
    super();
  }

  public async Handle(command: ICommand<ClearCmdMsg>): Promise<Result<CmdOk, CalculatorError>> {

    const msg = parseJson<ClearCmdMsg>(command.json);

    log("ClearCmd", msg);

    await this.calculator.dispatch(Inputs.cr());

    return Ok(null);
  }
}

export class EqualCmdHandler
  extends CommandHandler<EqualCmdMsg, CmdOk, CalculatorError>
{
  constructor(private readonly calculator: Calculator) {
    super();
  }

  public async Handle(command: ICommand<EqualCmdMsg>): Promise<Result<CmdOk, CalculatorError>> {

    const msg = parseJson<EqualCmdMsg>(command.json);

    log("EqualCmd", msg);

    await this.calculator.dispatch(Inputs.eq());

    return Ok(null);
  }
}

/* ============================= Query handlers ============================= */

export class GetDisplayQryHandler
  extends QueryHandler<GetDisplayQryMsg, string, CalculatorError>
{
  constructor(private readonly calculator: Calculator) {
    super();
  }

  public async handle(query: IQuery<GetDisplayQryMsg>): Promise<Result<string, CalculatorError>> {

    const msg = parseJson<GetDisplayQryMsg>(query.json);

    log("GetDisplayQry", msg);

    return Ok(this.calculator.display);
  }
}

export class GetStateQryHandler
  extends QueryHandler<GetStateQryMsg, NonUndefined, CalculatorError>
{
  constructor(private readonly calculator: Calculator) {
    super();
  }

  public async handle(query: IQuery<GetStateQryMsg>): Promise<Result<NonUndefined, CalculatorError>> {

    const msg = parseJson<GetStateQryMsg>(query.json);

    log("GetStateQry", msg);

    return Ok(this.calculator.state as NonUndefined);
  }
}

/* ============================= Facade ============================= */

export class CalculatorCqrs {

  private readonly digit: DigitCmdHandler;
  private readonly op: OperatorCmdHandler;
  private readonly clear: ClearCmdHandler;
  private readonly eq: EqualCmdHandler;

  private readonly getDisplay: GetDisplayQryHandler;
  private readonly getState: GetStateQryHandler;

  constructor(calculator: Calculator) {

    this.digit = new DigitCmdHandler(calculator);
    this.op = new OperatorCmdHandler(calculator);
    this.clear = new ClearCmdHandler(calculator);
    this.eq = new EqualCmdHandler(calculator);

    this.getDisplay = new GetDisplayQryHandler(calculator);
    this.getState = new GetStateQryHandler(calculator);
  }

  public async execute(cmd: ICommand<ICommandBase>)
    : Promise<Result<CmdOk, CalculatorError>>
  {
    const msg = parseJson<ICommandBase & { name: string }>(cmd.json);

    log("execute", msg);

    switch (msg.name) {

      case CalculatorMessageName.Digit:
        return this.digit.Handle(cmd as ICommand<DigitCmdMsg>);

      case CalculatorMessageName.Operator:
        return this.op.Handle(cmd as ICommand<OperatorCmdMsg>);

      case CalculatorMessageName.Clear:
        return this.clear.Handle(cmd as ICommand<ClearCmdMsg>);

      case CalculatorMessageName.Equal:
        return this.eq.Handle(cmd as ICommand<EqualCmdMsg>);

      default:
        return Err({
          kind: "UnknownCommand",
          name: msg.name
        });
    }
  }

  public async query(q: IQuery<IQueryBase>)
    : Promise<Result<NonUndefined, CalculatorError>>
  {
    const msg = parseJson<IQueryBase & { name: string }>(q.json);

    log("query", msg);

    switch (msg.name) {

      case CalculatorMessageName.GetDisplay:
        return this.getDisplay.handle(q as IQuery<GetDisplayQryMsg>);

      case CalculatorMessageName.GetState:
        return this.getState.handle(q as IQuery<GetStateQryMsg>);

      default:
        return Err({
          kind: "UnknownQuery",
          name: msg.name
        });
    }
  }
}