import { EventBehaviorBase } from "./EventBehaviorBase.js";

export class EventCommandBehavior extends EventBehaviorBase {
  constructor(
    id: string,
    eventName: string,
    private readonly handler: (evt: Event) => void
  ) {
    super(id, `event-command-${eventName}`, eventName);
  }

  protected handle(evt: Event): void {
    this.handler(evt);
  }
}
