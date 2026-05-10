import { describe, expect, it, vi } from 'vitest';
import type { PolygonCollisionSystem } from '@monorepo/core-collision-polygons';
import { GameObjectSubject } from '@monorepo/game-design-patterns';
import {
  CollisionSystemReactiveController,
  type CollisionObservedGameObject,
} from '../../src/Game/Collision/index.js';

describe('GameObjectSubject observer behavior', () => {
  it('should publish timeAdvanced when onTime is invoked', () => {
    const subject = new GameObjectSubject();
    const observer = vi.fn();

    subject.subscribeState('timeAdvanced', observer);
    subject.onTime(100);

    expect(observer).toHaveBeenCalledTimes(1);
    expect(observer).toHaveBeenCalledWith(100);
  });

  it('should publish positionChanged when controller moves the subject', () => {
    const subject = new GameObjectSubject();
    const observer = vi.fn();

    subject.subscribeState('positionChanged', observer);
    subject.setPosistion({ x: 10, y: 20 });

    expect(observer).toHaveBeenCalledTimes(1);
    expect(observer).toHaveBeenCalledWith({ x: 10, y: 20 });
  });
});

describe('CollisionSystemReactiveController observing GameObjectSubject', () => {
  it('should subscribe to observed game object position changes', () => {
    const host = new ReactiveControllerHostFixture();

    const observed = createObservedGameObjectFixture();

    const sut = new CollisionSystemReactiveController({
      host,
      collisionSystem: createCollisionSystemFixture(),
      sourcePolygonProvider: () => null,
      targetPolygonProvider: () => null,
    });

    sut.setObservedGameObject(observed);

    expect(observed.subscribeState).toHaveBeenCalledTimes(1);
    expect(observed.subscribeState).toHaveBeenCalledWith(
      'positionChanged',
      expect.any(Function)
    );
  });
});

class ReactiveControllerHostFixture {
  public readonly addController = vi.fn();
  public readonly removeController = vi.fn();
  public readonly requestUpdate = vi.fn();
}

function createObservedGameObjectFixture(): CollisionObservedGameObject & {
  readonly subscribeState: ReturnType<typeof vi.fn>;
  readonly unsubscribeState: ReturnType<typeof vi.fn>;
} {
  return {
    onTime: vi.fn(),
    getPosistion: vi.fn(() => ({ x: 0, y: 0 })),
    setPosistion: vi.fn(),
    getWorldPosistion: vi.fn(() => ({ x: 0, y: 0 })),
    getRotation: vi.fn(() => ({ x: 0, y: 0 })),
    getWorldRotation: vi.fn(() => ({ x: 0, y: 0 })),
    subscribeState: vi.fn(() => vi.fn()),
    unsubscribeState: vi.fn(() => true),
  };
}

function createCollisionSystemFixture(): PolygonCollisionSystem {
  return {
    detect: vi.fn(),
  } as unknown as PolygonCollisionSystem;
}
