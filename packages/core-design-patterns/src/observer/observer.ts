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

export type WeatherEvents = {
  temperatureChanged: { celsius: number; location: string };
  humidityChanged: { humidity: number; location: string };
};

export class WeatherStation extends TypedSubject<WeatherEvents> {
  setTemperature(celsius: number, location: string): void {
    this.notify('temperatureChanged', { celsius, location });
  }

  setHumidity(humidity: number, location: string): void {
    this.notify('humidityChanged', { humidity, location });
  }
}

export const weatherEventNames = ['temperatureChanged', 'humidityChanged'] as const satisfies readonly (keyof WeatherEvents)[];
