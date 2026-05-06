import { TypedSubject } from '@monorepo/core-design-patterns';

export interface ITimeObserver {
  onTime(time: number): void;
}

type TimeSchedulerEvents = {
  tick: number;
};

export class TimeSchdulerObserver {
  #subject = new TypedSubject<TimeSchedulerEvents>();
  #observerHandlers = new Map<ITimeObserver, (time: number) => void>();
  #animationFrameId: number | null = null;

  subscribe(observer: ITimeObserver): () => void {
    const existing = this.#observerHandlers.get(observer);
    if (existing) {
      return () => this.unsubscribe(observer);
    }

    const handler = (time: number): void => {
      observer.onTime(time);
    };
    this.#observerHandlers.set(observer, handler);
    this.#subject.subscribe('tick', handler);
    return () => this.unsubscribe(observer);
  }

  unsubscribe(observer: ITimeObserver): boolean {
    const handler = this.#observerHandlers.get(observer);
    if (!handler) return false;
    const didDelete = this.#subject.unsubscribe('tick', handler);
    this.#observerHandlers.delete(observer);
    return didDelete;
  }

  notify(time: number): void {
    this.#subject.notify('tick', time);
  }

  start(): void {
    if (this.#animationFrameId !== null) return;

    const tick = (time: number): void => {
      this.notify(time);
      this.#animationFrameId = globalThis.requestAnimationFrame(tick);
    };

    this.#animationFrameId = globalThis.requestAnimationFrame(tick);
  }

  stop(): void {
    if (this.#animationFrameId === null) return;

    globalThis.cancelAnimationFrame(this.#animationFrameId);
    this.#animationFrameId = null;
  }
}
