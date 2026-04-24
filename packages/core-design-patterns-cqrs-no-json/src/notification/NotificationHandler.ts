import type { INotification } from "./INotification.js";
// ======================================================================================
// packages/core-design-patterns-cqrs/src/notification/INotification.ts
// ======================================================================================
import type { INotificationBase } from "./INotificationBase.js";


export abstract class NotificationHandler<TMessage extends INotificationBase> {
    public abstract Handle(notification: INotification<TMessage>): void | Promise<void>;
}
