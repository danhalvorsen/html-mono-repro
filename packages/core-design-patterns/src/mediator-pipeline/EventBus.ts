import { INotification } from "../CQRS/notification/INotification.js";
import { INotificationBase } from "../CQRS/notification/INotificationBase.js";
import { INotificationHandler } from "./code.js";


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
