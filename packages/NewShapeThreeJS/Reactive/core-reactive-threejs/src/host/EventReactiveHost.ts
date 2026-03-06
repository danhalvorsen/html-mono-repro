// packages/NewShapeThreeJS/Reactive/core-reactive-threejs/src/host/EventReactiveHost.ts

import type { IEventReactiveHost } from "@monorepo/core-reactive-abstract";
import { ReactiveHost } from "./ReactiveHost.js";

export class EventReactiveHost
  extends ReactiveHost
  implements IEventReactiveHost<EventReactiveHost> {

  private readonly eventTarget = new EventTarget();

  public addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    this.eventTarget.addEventListener(type, listener, options);
  }

  public removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void {
    this.eventTarget.removeEventListener(type, listener, options);
  }

  public dispatchEvent(event: Event): boolean {
    return this.eventTarget.dispatchEvent(event);
  }
}