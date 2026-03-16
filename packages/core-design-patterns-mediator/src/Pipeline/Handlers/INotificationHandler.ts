import { INotificationBase, INotification } from "@monorepo/core-design-patterns-cqrs";

/* ============================================================================
 * Events (fan-out notifications)
 * ============================================================================ */

export interface INotificationHandler<TMessage extends INotificationBase> {
  handle(event: INotification<TMessage>): Promise<void>;
}
