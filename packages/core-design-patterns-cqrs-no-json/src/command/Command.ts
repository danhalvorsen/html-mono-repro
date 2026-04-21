import type { ICommand } from "./ICommand.js";
// ======================================================================================
// packages/core-design-patterns-cqrs/src/command/ICommand.ts
// ======================================================================================
import type { ICommandBase } from "./ICommandBase.js";

export class Command<TMessage extends ICommandBase> implements ICommand<TMessage> {
    private readonly _message: TMessage;

    public constructor(message: TMessage) {
        this._message = message;
    }

    public get message(): TMessage {
        return this._message;
    }
}
