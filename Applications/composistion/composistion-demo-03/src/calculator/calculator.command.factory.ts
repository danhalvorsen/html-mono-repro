// src/calculator/calculator.command.factory.ts
// FIX 1: CommandBuilder<TMsg> must constrain TMsg to ICommandBase.

import { CalculatorMessageName } from "./calculator.cqrs.names.js";
import type {
  DigitCmdMsg,
  OperatorCmdMsg,
  ClearCmdMsg,
  EqualCmdMsg,
} from "./calculator.cqrs.messages.js";
import type { Digit, Operator } from "./calculator.types.js";
import type { ICommand, ICommandBase } from "@monorepo/core-design-patterns-cqrs";

/* ============================= Builder base ============================= */

abstract class CommandBuilder<TMsg extends ICommandBase> {
  protected abstract buildMessage(): TMsg;

  public build(): ICommand<TMsg> {
    return { json: JSON.stringify(this.buildMessage()) };
  }
}

/* ============================= Builders ============================= */

export class DigitCommandBuilder extends CommandBuilder<DigitCmdMsg> {
  private digit?: Digit;

  public withDigit(d: Digit): this {
    this.digit = d;
    return this;
  }

  protected buildMessage(): DigitCmdMsg {
    if (!this.digit) throw new Error("DigitCommandBuilder: digit missing");
    return { name: CalculatorMessageName.Digit, digit: this.digit };
  }
}

export class OperatorCommandBuilder extends CommandBuilder<OperatorCmdMsg> {
  private op?: Operator;

  public withOperator(op: Operator): this {
    this.op = op;
    return this;
  }

  protected buildMessage(): OperatorCmdMsg {
    if (!this.op) throw new Error("OperatorCommandBuilder: operator missing");
    return { name: CalculatorMessageName.Operator, op: this.op };
  }
}

export class EqualCommandBuilder extends CommandBuilder<EqualCmdMsg> {
  protected buildMessage(): EqualCmdMsg {
    return { name: CalculatorMessageName.Equal };
  }
}

export class ClearCommandBuilder extends CommandBuilder<ClearCmdMsg> {
  protected buildMessage(): ClearCmdMsg {
    return { name: CalculatorMessageName.Clear };
  }
}

/* ============================= Factory ============================= */

export class CalculatorCommandFactory {
  public digit(d: Digit): ICommand<DigitCmdMsg> {
    return new DigitCommandBuilder().withDigit(d).build();
  }

  public operator(op: Operator): ICommand<OperatorCmdMsg> {
    return new OperatorCommandBuilder().withOperator(op).build();
  }

  public equal(): ICommand<EqualCmdMsg> {
    return new EqualCommandBuilder().build();
  }

  public clear(): ICommand<ClearCmdMsg> {
    return new ClearCommandBuilder().build();
  }
}