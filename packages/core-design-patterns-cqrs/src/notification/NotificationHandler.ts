// packages/core-design-patterns/src/CQRS/NotificationHandler.ts
import type { INotificationBase } from "./INotificationBase.js";
import type { INotification } from "./INotification.js";

export abstract class NotificationHandler<TMessage extends INotificationBase> {
  public abstract Handle(notification: INotification<TMessage>): void | Promise<void>;
}