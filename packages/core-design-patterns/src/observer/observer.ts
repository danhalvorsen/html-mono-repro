export type Observer<EventMap extends Record<string, unknown>, K extends keyof EventMap> = (
  payload: Readonly<EventMap[K]>
) => void;

export interface Subject<EventMap extends Record<string, unknown>> {
  subscribe<K extends keyof EventMap>(
    eventName: K,
    observer: Observer<EventMap, K>
  ): () => void;
  unsubscribe<K extends keyof EventMap>(eventName: K, observer: Observer<EventMap, K>): boolean;
  notify<K extends keyof EventMap>(eventName: K, payload: EventMap[K]): void;
}

export { TypedSubject } from './TypedSubject.js';
