import type { IObserver } from "./IObserver.js";

export interface IObservable<T> {
  subscribe(observer: IObserver<T>): void;
  unsubscribe(observer: IObserver<T>): void;
}
