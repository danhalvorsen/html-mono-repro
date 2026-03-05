import { INotificationBase, INotification } from "@monorepo/core-design-patterns-cqrs";
import { IHandler } from "./IHandler.js";

/* ============================================================================
 * Events (fan-out notifications)
 * ============================================================================ */

export interface INotificationHandler<TMessage extends INotificationBase> extends IHandler<TMessage, void> {
  handle(event: INotification<TMessage>): Promise<void>;
}
