import { describe, expect, it, vi } from 'vitest';
import { TypedSubject } from '../../src/observer/observer.js';

type TestEvents = {
  alpha: { value: number };
  beta: { message: string };
};

describe('observer core', () => {
  it('should notify observers subscribed to matching event', () => {
    const subject = new TypedSubject<TestEvents>();
    const onAlpha = vi.fn();
    const onBeta = vi.fn();

    subject.subscribe('alpha', onAlpha);
    subject.subscribe('beta', onBeta);

    subject.notify('alpha', { value: 42 });

    expect(onAlpha).toHaveBeenCalledTimes(1);
    expect(onAlpha).toHaveBeenCalledWith({ value: 42 });
    expect(onBeta).not.toHaveBeenCalled();
  });

  it('should unsubscribe via disposer and stop receiving events', () => {
    const subject = new TypedSubject<TestEvents>();
    const onAlpha = vi.fn();

    const stop = subject.subscribe('alpha', onAlpha);
    stop();

    subject.notify('alpha', { value: 7 });

    expect(onAlpha).not.toHaveBeenCalled();
  });

  it('should return false when unsubscribing unknown observer', () => {
    const subject = new TypedSubject<TestEvents>();
    const onAlpha = vi.fn();

    const didDelete = subject.unsubscribe('alpha', onAlpha);

    expect(didDelete).toBe(false);
  });
});
