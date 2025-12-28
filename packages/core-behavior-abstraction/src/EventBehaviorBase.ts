import { BehaviorBase } from "./BehaviorBase.js";

export abstract class EventBehaviorBase extends BehaviorBase {
  constructor(
    id: string,
    name: string,
    protected readonly eventName: string
  ) {
    super(id, name);
  }

  protected abstract handle(evt: Event): void;

  apply(target: unknown): void {
    if (!(target instanceof EventTarget)) return;
    target.addEventListener(this.eventName, e => this.handle(e));
  }
}
