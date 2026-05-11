// Libraries/core-reactive/src/Filesystem/DirectoryEventBus.ts
import { ObserverCollection } from "../observers/ObserverCollection.js";
import type { IObservable } from "../observers/IObservable.js";
import type { IObserver } from "../observers/IObserver.js";
import type { FileSystemEvent } from "./DirectoryEvent.js";

export class DirectoryEventBus implements IObservable<FileSystemEvent> {
  private readonly observers = new ObserverCollection<FileSystemEvent>();

  emit(event: FileSystemEvent): void {
    this.observers.emit(event);
  }

  subscribe(observer: IObserver<FileSystemEvent>): void {
    this.observers.add(observer);
  }

  unsubscribe(observer: IObserver<FileSystemEvent>): void {
    this.observers.remove(observer);
  }
}
