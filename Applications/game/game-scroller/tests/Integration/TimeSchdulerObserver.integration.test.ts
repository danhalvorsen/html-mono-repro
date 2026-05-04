import { describe, expect, it, vi } from 'vitest';
import { TimeSchdulerObserver, type ITimeObserver } from '../../src/Game/ObjectObjectTimerObserver.js';

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
    const requestAnimationFrameSpy = vi
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation(((callback: FrameRequestCallback): number => {
        scheduledCallback = callback as unknown as (time: number) => void;
        return 1;
      }) as typeof requestAnimationFrame);

    const cancelAnimationFrameSpy = vi
      .spyOn(globalThis, 'cancelAnimationFrame')
      .mockImplementation(() => {});

    scheduler.start();
    scheduledCallback?.(42);

    expect(gameObject.receivedTimes).toEqual([42]);

    scheduler.stop();
    expect(requestAnimationFrameSpy).toHaveBeenCalled();
    expect(cancelAnimationFrameSpy).toHaveBeenCalledWith(1);

    requestAnimationFrameSpy.mockRestore();
    cancelAnimationFrameSpy.mockRestore();
  });
});
