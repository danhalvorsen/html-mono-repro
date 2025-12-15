import {
  CommonEvent,
  ICommonEvent,
  ICommonEventData,
  ICommonEventHandler
} from "../types/common/common-event.js";
import { EventName } from "../types/common/event-name.js";
import { TimeStamp } from "../types/common/time-stamp.js";

export namespace Events {
  export class EventBus {
    private readonly handlers = new Map<EventName, Set<ICommonEventHandler<any>>>();
    private disposed = false;

    register<TData extends ICommonEventData>(
      event: EventName,
      handler: ICommonEventHandler<TData>
    ): void {
      if (this.disposed) return;

      if (!this.handlers.has(event)) {
        this.handlers.set(event, new Set());
      }
      this.handlers.get(event)!.add(handler);
    }

    unregister<TData extends ICommonEventData>(
      event: EventName,
      handler: ICommonEventHandler<TData>
    ): void {
      const hs = this.handlers.get(event);
      if (!hs) return;

      hs.delete(handler);

      if (hs.size === 0) {
        this.handlers.delete(event);
      }
    }

    async dispatch<TData extends ICommonEventData>(
      event: ICommonEvent<TData>
    ): Promise<void> {
      if (this.disposed) return;

      const hs = this.handlers.get(event.name);
      if (!hs) return;

      for (const handler of hs) {
        try {
          const result = handler.handle(event);
          if (result instanceof Promise) {
            await result;
          }
        } catch (err) {
          console.error("EventBus handler error:", err);
        }
      }
    }

    async emit<TData extends ICommonEventData>(
      name: EventName,
      data: TData
    ): Promise<void> {
      const evt = new CommonEvent(name, TimeStamp.now(), data);
      await this.dispatch(evt);
      evt.dispose();
    }

    dispose(): void {
      if (this.disposed) return;
      this.disposed = true;

      this.handlers.clear();
    }
  }
}

export type EventBus = Events.EventBus;
export const EventBus = Events.EventBus;
