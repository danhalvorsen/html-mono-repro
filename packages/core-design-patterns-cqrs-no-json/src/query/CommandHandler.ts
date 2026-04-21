import type { Result, NonUndefined } from "@monorepo/core-design-patterns";
import { ICommand } from "../command/ICommand.js";
import { ICommandBase } from "../command/ICommandBase.js";
 
export abstract class CommandHandler<
    TMessage extends ICommandBase,
    TResult extends NonUndefined,
    TError extends NonUndefined
> {
    public abstract Handle(command: ICommand<TMessage>): Promise<Result<TResult, TError>>;
}
