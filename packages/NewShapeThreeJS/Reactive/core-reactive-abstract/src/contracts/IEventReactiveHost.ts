import { IReactiveHost } from "./IReactiveHost.js";

export interface IEventReactiveHost<THost> extends IReactiveHost<THost> {
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;

  dispatchEvent(event: Event): boolean;
}