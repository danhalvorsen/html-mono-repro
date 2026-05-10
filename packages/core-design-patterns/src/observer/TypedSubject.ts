import type { Subject, Observer } from "./observer.js";

export class TypedSubject<EventMap extends Record<string, unknown>> implements Subject<EventMap> {
  #observers = new Map<keyof EventMap, Set<Observer<EventMap, keyof EventMap>>>();

  subscribe<K extends keyof EventMap>(eventName: K, observer: Observer<EventMap, K>): () => void {
    const bucket = this.#ensureBucket(eventName);
    bucket.add(observer as Observer<EventMap, keyof EventMap>);

    return () => {
      this.unsubscribe(eventName, observer);
    };
  }

  unsubscribe<K extends keyof EventMap>(eventName: K, observer: Observer<EventMap, K>): boolean {
    const bucket = this.#observers.get(eventName);
    if (!bucket) return false;

    const didDelete = bucket.delete(observer as Observer<EventMap, keyof EventMap>);
    if (bucket.size === 0) {
      this.#observers.delete(eventName);
    }

    return didDelete;
  }

  notify<K extends keyof EventMap>(eventName: K, payload: EventMap[K]): void {
    const bucket = this.#observers.get(eventName);
    if (!bucket || bucket.size === 0) return;

    for (const observer of bucket) {
      (observer as Observer<EventMap, K>)(payload);
    }
  }

  #ensureBucket<K extends keyof EventMap>(eventName: K): Set<Observer<EventMap, keyof EventMap>> {
    const existing = this.#observers.get(eventName);
    if (existing) return existing;

    const created = new Set<Observer<EventMap, keyof EventMap>>();
    this.#observers.set(eventName, created);
    return created;
  }
}
