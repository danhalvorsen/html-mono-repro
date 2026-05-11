import { BehaviorBase } from "./BehaviorBase.js";

interface EventTargetLike {
  addEventListener(eventName: string, listener: (event: unknown) => void): void;
}

export abstract class EventBehaviorBase extends BehaviorBase {
  constructor(
    id: string,
    name: string,
    protected readonly eventName: string
  ) {
    super(id, name);
  }

  protected abstract handle(evt: unknown): void;

  apply(target: unknown): void {
    if (!isEventTargetLike(target)) return;
    target.addEventListener(this.eventName, e => this.handle(e));
  }
}

function isEventTargetLike(value: unknown): value is EventTargetLike {
  return (
    typeof value === "object" &&
    value !== null &&
    "addEventListener" in value &&
    typeof (value as { addEventListener?: unknown }).addEventListener === "function"
  );
}
