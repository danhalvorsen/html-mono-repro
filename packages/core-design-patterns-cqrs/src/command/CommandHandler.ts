 
import { ICommand } from "./ICommand.js";
import type { ICommandBase } from "./ICommandBase.js";
import  { Result, NonUndefined } from "@monorepo/core-design-patterns";  

export abstract class CommandHandler<
  TMessage extends ICommandBase,
  TResult extends NonUndefined,
  TError extends NonUndefined
> {
  public abstract Handle(command: ICommand<TMessage>): Promise<Result<TResult, TError>>;
}