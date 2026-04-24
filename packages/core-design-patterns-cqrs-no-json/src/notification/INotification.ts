// ======================================================================================
// packages/core-design-patterns-cqrs/src/notification/INotification.ts
// ======================================================================================
import type { INotificationBase } from "./INotificationBase.js";


export interface INotification<TMessage extends INotificationBase> {
    readonly message: TMessage;
}
