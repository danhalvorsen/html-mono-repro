// src/calculator/calculator.cqrs.ts
import type { Result, NonUndefined, ICommand, IQuery } from "@monorepo/core-design-patterns";
import { Ok, Err, CommandHandler, QueryHandler } from "@monorepo/core-design-patterns";

import type { Calculator } from "./calculator.js";
import type {
  CalculatorCommand,
  CalculatorQuery,
  CalculatorQueryResult,
  DigitCmd,
  // OperatorCmd, ClearCmd, EqualCmd, GetDisplayQry, GetStateQry  // (assumed in your messages file)
} from "./calculator.cqrs.messages.js";
import type { Digit, Operator } from "./calculator.types.js";
import { CalculatorMessageName } from "./calculator.cqrs.names.js";
import { Inputs } from "./calculator.inputs.js";

/* ============================= Errors ============================= */

export type CalculatorError =
  | { readonly kind: "UnknownCommand"; readonly name: string }
  | { readonly kind: "UnknownQuery"; readonly name: string }
  | { readonly kind: "ExecutionFailed"; readonly name: string; readonly error: unknown };

function parseJson<T>(json: string): T {
  return JSON.parse(json) as T;
}

/**
 * Commands return `null` because `Result<T, E>` in core-design-patterns requires `T extends NonUndefined`
 * and `void` is not allowed. `null` *is* allowed by your `NonUndefined = {} | null`.
 */
type CmdOk = null;

/* ============================= Command handlers ============================= */

export type DigitCommand = ICommand<DigitCmd> & { readonly name: typeof CalculatorMessageName.Digit };
// If you have explicit payload types, prefer them here:
export type OperatorCommand = ICommand<{ readonly op: string }> & { readonly name: typeof CalculatorMessageName.Operator };
export type ClearCommand = ICommand<{ readonly _?: null }> & { readonly name: typeof CalculatorMessageName.Clear };
export type EqualCommand = ICommand<{ readonly _?: null }> & { readonly name: typeof CalculatorMessageName.Equal };

export class DigitCmdHandler extends CommandHandler<DigitCommand, CmdOk, CalculatorError> {
  Handle(_command: ICommand<DigitCommand>): Promise<Result<null, CalculatorError>> {
    throw new Error("Method not implemented.");
  }
  public constructor(private readonly calculator: Calculator) {
    super();
  }

  public async handle(command: DigitCommand): Promise<Result<CmdOk, CalculatorError>> {
    const payload = parseJson<{ digit?: Digit; payload?: { digit?: Digit } }>(command.json);
    const digit = payload.digit ?? payload.payload?.digit;

    if (digit === undefined) {
      return Err<CmdOk, CalculatorError>({ kind: "ExecutionFailed", name: command.name, error: "Missing digit" });
    }

    await this.calculator.dispatch(Inputs.digit(digit));
    return Ok<CmdOk, CalculatorError>(null);
  }
}

export class OperatorCmdHandler extends CommandHandler<OperatorCommand, CmdOk, CalculatorError> {
  Handle(_command: ICommand<OperatorCommand>): Promise<Result<null, CalculatorError>> {
    throw new Error("Method not implemented.");
  }
  public constructor(private readonly calculator: Calculator) {
    super();
  }

  public async handle(command: OperatorCommand): Promise<Result<CmdOk, CalculatorError>> {
    const payload = parseJson<{ op?: Operator; payload?: { op?: Operator } }>(command.json);
    const op = payload.op ?? payload.payload?.op;

    if (op === undefined) {
      return Err<CmdOk, CalculatorError>({ kind: "ExecutionFailed", name: command.name, error: "Missing operator" });
    }

    await this.calculator.dispatch(Inputs.op(op));
    return Ok<CmdOk, CalculatorError>(null);
  }
}

export class ClearCmdHandler extends CommandHandler<ClearCommand, CmdOk, CalculatorError> {
  Handle(_command: ICommand<ClearCommand>): Promise<Result<null, CalculatorError>> {
    throw new Error("Method not implemented.");
  }
  public constructor(private readonly calculator: Calculator) {
    super();
  }

  public async handle(_command: ClearCommand): Promise<Result<CmdOk, CalculatorError>> {
    await this.calculator.dispatch(Inputs.cr());
    return Ok<CmdOk, CalculatorError>(null);
  }
}

export class EqualCmdHandler extends CommandHandler<EqualCommand, CmdOk, CalculatorError> {
  Handle(_command: ICommand<EqualCommand>): Promise<Result<null, CalculatorError>> {
    throw new Error("Method not implemented.");
  }
  public constructor(private readonly calculator: Calculator) {
    super();
  }

  public async handle(_command: EqualCommand): Promise<Result<CmdOk, CalculatorError>> {
    await this.calculator.dispatch(Inputs.eq());
    return Ok<CmdOk, CalculatorError>(null);
  }
}

/* ============================= Query handlers ============================= */

export type GetDisplayQuery = IQuery<{ readonly _?: null }> & { readonly name: typeof CalculatorMessageName.GetDisplay };
export type GetStateQuery = IQuery<{ readonly _?: null }> & { readonly name: typeof CalculatorMessageName.GetState };

export class GetDisplayQryHandler extends QueryHandler<GetDisplayQuery, string, CalculatorError> {
  public constructor(private readonly calculator: Calculator) {
    super();
  }

  public async handle(_query: GetDisplayQuery): Promise<Result<string, CalculatorError>> {
    // Ensure display is never `undefined` in Calculator; otherwise return a safe NonUndefined fallback.
    return Ok<string, CalculatorError>(this.calculator.display);
  }
}

export class GetStateQryHandler extends QueryHandler<GetStateQuery, NonUndefined, CalculatorError> {
  public constructor(private readonly calculator: Calculator) {
    super();
  }

  public async handle(_query: GetStateQuery): Promise<Result<NonUndefined, CalculatorError>> {
    // If `calculator.state` is guaranteed non-undefined, tighten the return type accordingly.
    return Ok<NonUndefined, CalculatorError>(this.calculator.state as NonUndefined);
  }
}

/* ============================= Facade / Dispatcher ============================= */

export class CalculatorCqrs {
  private readonly digit: DigitCmdHandler;
  private readonly op: OperatorCmdHandler;
  private readonly clear: ClearCmdHandler;
  private readonly eq: EqualCmdHandler;

  private readonly getDisplay: GetDisplayQryHandler;
  private readonly getState: GetStateQryHandler;

  public constructor(calculator: Calculator) {
    this.digit = new DigitCmdHandler(calculator);
    this.op = new OperatorCmdHandler(calculator);
    this.clear = new ClearCmdHandler(calculator);
    this.eq = new EqualCmdHandler(calculator);

    this.getDisplay = new GetDisplayQryHandler(calculator);
    this.getState = new GetStateQryHandler(calculator);
  }

  public async execute(cmd: CalculatorCommand): Promise<Result<CmdOk, CalculatorError>> {
    try {
      switch (cmd.name) {
        case CalculatorMessageName.Digit:
          return await this.digit.handle(cmd as DigitCommand);

        case CalculatorMessageName.Operator:
          return await this.op.handle(cmd as OperatorCommand);

        case CalculatorMessageName.Clear:
          return await this.clear.handle(cmd as ClearCommand);

        case CalculatorMessageName.Equal:
          return await this.eq.handle(cmd as EqualCommand);

        default:
          return Err<CmdOk, CalculatorError>({ kind: "UnknownCommand", name: (cmd as { name?: string }).name ?? "unknown" });
      }
    } catch (e) {
      return Err<CmdOk, CalculatorError>({ kind: "ExecutionFailed", name: (cmd as { name?: string }).name ?? "unknown", error: e });
    }
  }

  public async query<Q extends CalculatorQuery>(q: Q): Promise<Result<CalculatorQueryResult<Q>, CalculatorError>> {
    try {
      switch (q.name) {
        case CalculatorMessageName.GetDisplay:
          return (await this.getDisplay.handle(q as GetDisplayQuery)) as Result<CalculatorQueryResult<Q>, CalculatorError>;

        case CalculatorMessageName.GetState:
          return (await this.getState.handle(q as GetStateQuery)) as Result<CalculatorQueryResult<Q>, CalculatorError>;

        default:
          return Err<CalculatorQueryResult<Q>, CalculatorError>({ kind: "UnknownQuery", name: (q as { name?: string }).name ?? "unknown" });
      }
    } catch (e) {
      return Err<CalculatorQueryResult<Q>, CalculatorError>({ kind: "ExecutionFailed", name: (q as { name?: string }).name ?? "unknown", error: e });
    }
  }
}