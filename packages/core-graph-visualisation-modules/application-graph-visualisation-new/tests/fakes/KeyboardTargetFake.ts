export interface KeyboardEventLike extends Event {
  key?: string;
}

export class KeyboardTargetFake extends EventTarget {
  pressKey(key: string): void {
    const event = new Event("keydown") as KeyboardEventLike;
    event.key = key;
    this.dispatchEvent(event);
  }
}
