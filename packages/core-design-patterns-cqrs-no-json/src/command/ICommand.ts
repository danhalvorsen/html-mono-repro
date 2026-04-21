// ======================================================================================
// packages/core-design-patterns-cqrs/src/command/ICommand.ts
// ======================================================================================
import type { ICommandBase } from "./ICommandBase.js";


export interface ICommand<TMessage extends ICommandBase> {
    readonly message: TMessage;
}
