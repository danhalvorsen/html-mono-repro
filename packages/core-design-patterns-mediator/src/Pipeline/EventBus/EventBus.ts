import { INotificationBase, INotification } from "@monorepo/core-design-patterns-cqrs";
import { INotificationHandler } from "../Handlers/INotificationHandler.js";

export class EventBus {
  public constructor(
    private readonly handlers: ReadonlyArray<INotificationHandler<INotificationBase>>
  ) { }

  public async publish<TMessage extends INotificationBase>(
    event: INotification<TMessage>
  ): Promise<void> {
    await Promise.all(this.handlers.map(h => h.handle(event as any)));
  }
}
