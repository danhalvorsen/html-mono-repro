// ======================================================================================
// packages/core-design-patterns-cqrs/src/query/IQuery.ts
// ======================================================================================
import type { IQueryBase } from "./IQueryBase.js";


export interface IQuery<TMessage extends IQueryBase> {
    readonly message: TMessage;
}
