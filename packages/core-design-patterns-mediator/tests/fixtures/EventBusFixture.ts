import type {
  INotification,
  INotificationBase,
} from "@monorepo/core-design-patterns-cqrs";

import { EventBus, type INotificationHandler } from "../../src/index.js";

export class RecordingNotificationHandler
  implements INotificationHandler<INotificationBase>
{
  public readonly events: Array<INotification<INotificationBase>> = [];

  public async handle(event: INotification<INotificationBase>): Promise<void> {
    this.events.push(event);
  }
}

export class EventBusFixture {
  public handler(): RecordingNotificationHandler {
    return new RecordingNotificationHandler();
  }

  public bus(
    ...handlers: ReadonlyArray<INotificationHandler<INotificationBase>>
  ): EventBus {
    return new EventBus(handlers);
  }

  public event(
    json = JSON.stringify({ type: "FixtureEvent", payload: { ok: true } }),
  ): INotification<INotificationBase> {
    return { json };
  }
}
