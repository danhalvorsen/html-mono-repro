import type { IObserver } from "./IObserver.js";

export class ObserverCollection<T> {
  private readonly observers = new Set<IObserver<T>>();

  add(obs: IObserver<T>): void {
    this.observers.add(obs);
  }

  remove(obs: IObserver<T>): void {
    this.observers.delete(obs);
  }

  emit(value: T): void {
    this.observers.forEach(obs => obs.next(value));
  }
}
