import type { MidiLogicalEvent } from "../../src/midi-event-engine.js";

export type EventListener = (event: MidiLogicalEvent) => void;

export class EventDispatchFixture {
  private readonly allListeners: EventListener[] = [];
  private readonly byKind = new Map<string, EventListener[]>();

  public onAny(listener: EventListener): void {
    this.allListeners.push(listener);
  }

  public onKind(kind: string, listener: EventListener): void {
    const listeners = this.byKind.get(kind) ?? [];
    listeners.push(listener);
    this.byKind.set(kind, listeners);
  }

  public dispatch(events: readonly MidiLogicalEvent[]): void {
    for (const event of events) {
      for (const listener of this.allListeners) {
        listener(event);
      }

      const kindListeners = this.byKind.get(event.kind) ?? [];
      for (const listener of kindListeners) {
        listener(event);
      }
    }
  }
}
