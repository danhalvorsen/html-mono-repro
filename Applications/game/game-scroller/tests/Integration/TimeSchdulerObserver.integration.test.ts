import { describe, expect, it, vi } from 'vitest';
import { TimeSchdulerObserver, type ITimeObserver } from '@monorepo/game-design-patterns';

class FakeGameObjectObserver implements ITimeObserver {
  readonly receivedTimes: number[] = [];

  public onTime(time: number): void {
    this.receivedTimes.push(time);
  }
}

describe('TimeSchdulerObserver integration', () => {
  it('should deliver time data to a newly subscribed game object', () => {
    const scheduler = new TimeSchdulerObserver();
    const gameObject = new FakeGameObjectObserver();

    scheduler.subscribe(gameObject);
    scheduler.notify(123.5);

    expect(gameObject.receivedTimes).toEqual([123.5]);
  });

  it('should stop delivering time data after unsubscribe', () => {
    const scheduler = new TimeSchdulerObserver();
    const gameObject = new FakeGameObjectObserver();

    const unsubscribe = scheduler.subscribe(gameObject);
    scheduler.notify(10);
    unsubscribe();
    scheduler.notify(20);

    expect(gameObject.receivedTimes).toEqual([10]);
  });

  it('should deliver frame time when started and a frame is executed', () => {
    const scheduler = new TimeSchdulerObserver();
    const gameObject = new FakeGameObjectObserver();

    scheduler.subscribe(gameObject);

    let scheduledCallback: ((time: number) => void) | null = null;
    const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
    const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;
    globalThis.requestAnimationFrame = ((callback: FrameRequestCallback): number => {
      scheduledCallback = callback as unknown as (time: number) => void;
      return 1;
    }) as typeof requestAnimationFrame;
    globalThis.cancelAnimationFrame = (() => {}) as typeof cancelAnimationFrame;

    const requestAnimationFrameMock = vi.fn(globalThis.requestAnimationFrame);
    const cancelAnimationFrameMock = vi.fn(globalThis.cancelAnimationFrame);
    globalThis.requestAnimationFrame = requestAnimationFrameMock as typeof requestAnimationFrame;
    globalThis.cancelAnimationFrame = cancelAnimationFrameMock as typeof cancelAnimationFrame;

    scheduler.start();
    scheduledCallback?.(42);

    expect(gameObject.receivedTimes).toEqual([42]);

    scheduler.stop();
    expect(requestAnimationFrameMock).toHaveBeenCalled();
    expect(cancelAnimationFrameMock).toHaveBeenCalledWith(1);
    if (originalRequestAnimationFrame) {
      globalThis.requestAnimationFrame = originalRequestAnimationFrame;
    } else {
      // @ts-expect-error cleanup when API is absent in node-like env
      delete globalThis.requestAnimationFrame;
    }
    if (originalCancelAnimationFrame) {
      globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
    } else {
      // @ts-expect-error cleanup when API is absent in node-like env
      delete globalThis.cancelAnimationFrame;
    }
  });
});
