import { EventBehaviorBase } from "./EventBehaviorBase.js";

export class EventCommandBehavior extends EventBehaviorBase {
  constructor(
    id: string,
    eventName: string,
    private readonly handler: (evt: unknown) => void
  ) {
    super(id, `event-command-${eventName}`, eventName);
  }

  protected handle(evt: unknown): void {
    this.handler(evt);
  }
}
