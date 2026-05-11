import { Vector2 } from "@monorepo/core-math";
import { describe, expect, it } from "vitest";
import { Rocket } from "./Rocket.js";
import { RocketLauncherGameObject, type RocketPositionProvider } from "./RocketLauncherGameObject.js";

describe("RocketLauncherGameObject", () => {
  it("should create a rocket when mouse is inside detection radius", () => {
    const mouse = new MutablePositionProvider(new Vector2(30, 40));
    const launcher = createLauncher({ mouseGameObject: mouse });

    const rocket = launcher.update(0);

    expect(rocket).toBeInstanceOf(Rocket);
    expect(launcher.rockets).toHaveLength(1);
    expect(rocket?.isActive()).toBe(true);
    expectVectorCloseTo(rocket!.getPosition(), new Vector2(0, 0));
    expectVectorCloseTo(rocket!.direction, new Vector2(0.6, 0.8));
  });

  it("should not create a rocket when mouse is outside detection radius", () => {
    const mouse = new MutablePositionProvider(new Vector2(200, 0));
    const launcher = createLauncher({ mouseGameObject: mouse });

    const rocket = launcher.update(0);

    expect(rocket).toBeNull();
    expect(launcher.rockets).toHaveLength(0);
  });

  it("should enforce cooldown without stopping active rockets", () => {
    const mouse = new MutablePositionProvider(new Vector2(100, 0));
    const launcher = createLauncher({
      mouseGameObject: mouse,
      cooldownSeconds: 1,
      lifetimeSeconds: 2,
    });

    const first = launcher.update(0);
    const second = launcher.update(0.5);

    expect(second).toBeNull();
    expect(launcher.rockets).toHaveLength(1);
    expect(first?.isActive()).toBe(true);
    expectVectorCloseTo(first!.getPosition(), new Vector2(52.5, 0));
  });

  it("should continue active rockets after mouse leaves detection radius", () => {
    const mouse = new MutablePositionProvider(new Vector2(100, 0));
    const launcher = createLauncher({
      mouseGameObject: mouse,
      cooldownSeconds: 0,
      lifetimeSeconds: 2,
    });

    const rocket = launcher.update(0);

    mouse.setPosistion(new Vector2(500, 0));
    const nextRocket = launcher.update(0.5);

    expect(nextRocket).toBeNull();
    expect(rocket?.isActive()).toBe(true);
    expectVectorCloseTo(rocket!.getPosition(), new Vector2(52.5, 0));
  });

  it("should reuse inactive rockets before creating new rockets", () => {
    const mouse = new MutablePositionProvider(new Vector2(100, 0));
    const launcher = createLauncher({
      mouseGameObject: mouse,
      cooldownSeconds: 0,
      lifetimeSeconds: 0.1,
      maxRockets: 2,
    });

    const first = launcher.update(0);
    launcher.update(0.2);

    const reused = launcher.update(0.3);

    expect(reused).toBe(first);
    expect(launcher.rockets).toHaveLength(1);
    expect(reused?.isActive()).toBe(true);
  });

  it("should reuse oldest active rocket when pool is full", () => {
    const mouse = new MutablePositionProvider(new Vector2(100, 0));
    const launcher = createLauncher({
      mouseGameObject: mouse,
      cooldownSeconds: 0,
      lifetimeSeconds: 10,
      maxRockets: 2,
    });

    const oldest = launcher.update(0);
    const newest = launcher.update(0.1);
    const reused = launcher.update(0.2);

    expect(launcher.rockets).toHaveLength(2);
    expect(oldest).not.toBeNull();
    expect(newest).not.toBeNull();
    expect(reused).toBe(oldest);
    expect(reused?.startedAt).toBe(0.2);
  });

  it("should reject invalid launcher options", () => {
    const mouse = new MutablePositionProvider(new Vector2(1, 0));

    expect(() =>
      createLauncher({
        mouseGameObject: mouse,
        maxRockets: 0,
      }),
    ).toThrow(RangeError);
  });
});

class MutablePositionProvider implements RocketPositionProvider {
  #position: Vector2;

  public constructor(position: Vector2) {
    this.#position = position;
  }

  public getPosistion(): Vector2 {
    return new Vector2(this.#position.x, this.#position.y);
  }

  public setPosistion(position: Vector2): void {
    this.#position = position;
  }
}

function createLauncher(
  overrides: Partial<ConstructorParameters<typeof RocketLauncherGameObject>[0]> = {},
): RocketLauncherGameObject {
  return new RocketLauncherGameObject({
    position: new Vector2(0, 0),
    detectionRadius: 150,
    maxRockets: 4,
    cooldownSeconds: 0,
    initialSpeed: 100,
    accelerationMagnitude: 20,
    lifetimeSeconds: 1,
    ...overrides,
  });
}

function expectVectorCloseTo(actual: Vector2, expected: Vector2): void {
  expect(actual.x).toBeCloseTo(expected.x);
  expect(actual.y).toBeCloseTo(expected.y);
}