// packages/core-design-patterns/src/CQRS/INotification.ts
import type { INotificationBase } from "./INotificationBase.js";

export interface INotification<TMessage extends INotificationBase> {
  readonly json: string;
}