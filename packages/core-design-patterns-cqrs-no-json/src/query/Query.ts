import type { IQuery } from "./IQuery.js";
// ======================================================================================
// packages/core-design-patterns-cqrs/src/query/IQuery.ts
// ======================================================================================
import type { IQueryBase } from "./IQueryBase.js";


export class Query<TMessage extends IQueryBase> implements IQuery<TMessage> {
    private readonly _message: TMessage;

    public constructor(message: TMessage) {
        this._message = message;
    }

    public get message(): TMessage {
        return this._message;
    }
}
