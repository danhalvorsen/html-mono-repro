// packages/core-design-patterns/src/CQRS/CommandHandler.ts
import type { NonUndefined, Result } from "../../functional/result/result.js";
import { ICommand } from "./ICommand.js";
import type { ICommandBase } from "./ICommandBase.js";

export abstract class CommandHandler<
  TMessage extends ICommandBase,
  TResult extends NonUndefined,
  TError extends NonUndefined
> {
  public abstract Handle(command: ICommand<TMessage>): Promise<Result<TResult, TError>>;
}