import { Vector2 } from "@monorepo/core-math";
import { describe, expect, it } from "vitest";
import { Rocket } from "./Rocket.js";

describe("Rocket", () => {
  it("should start at launcher position and be visible when started", () => {
    const rocket = createRocket();

    rocket.start({
      startPosition: new Vector2(10, 20),
      direction: new Vector2(1, 0),
      initialSpeed: 100,
      accelerationMagnitude: 20,
      lifetimeSeconds: 1,
      startedAt: 5,
    });

    expectVectorCloseTo(rocket.getPosition(), new Vector2(10, 20));
    expect(rocket.isActive()).toBe(true);
    expect(rocket.isVisible()).toBe(true);
  });

  it("should move using the physical straight-line formula", () => {
    const rocket = createRocket();

    rocket.start({
      startPosition: new Vector2(10, 20),
      direction: new Vector2(1, 0),
      initialSpeed: 100,
      accelerationMagnitude: 20,
      lifetimeSeconds: 2,
      startedAt: 0,
    });

    rocket.update(0.5);

    expectVectorCloseTo(rocket.getPosition(), new Vector2(62.5, 20));
  });

  it("should keep getVelocityVector as the initial launch velocity", () => {
    const rocket = createRocket();

    rocket.start({
      startPosition: new Vector2(0, 0),
      direction: new Vector2(0, 2),
      initialSpeed: 40,
      accelerationMagnitude: 10,
      lifetimeSeconds: 2,
      startedAt: 0,
    });

    rocket.update(1);

    expectVectorCloseTo(rocket.getVelocityVector(), new Vector2(0, 40));
  });

  it("should become invisible and clamp position when lifetime expires", () => {
    const rocket = createRocket();

    rocket.start({
      startPosition: new Vector2(0, 0),
      direction: new Vector2(1, 0),
      initialSpeed: 10,
      accelerationMagnitude: 10,
      lifetimeSeconds: 1,
      startedAt: 0,
    });

    rocket.update(2);

    expect(rocket.elapsedLifetimeSeconds).toBe(1);
    expect(rocket.isActive()).toBe(false);
    expect(rocket.isVisible()).toBe(false);
    expectVectorCloseTo(rocket.getPosition(), new Vector2(15, 0));
  });

  it("should be reusable after lifetime expires", () => {
    const rocket = createRocket();

    rocket.start({
      startPosition: new Vector2(0, 0),
      direction: new Vector2(1, 0),
      initialSpeed: 10,
      accelerationMagnitude: 0,
      lifetimeSeconds: 1,
      startedAt: 0,
    });

    rocket.update(1);

    rocket.start({
      startPosition: new Vector2(5, 6),
      direction: new Vector2(0, -1),
      initialSpeed: 30,
      accelerationMagnitude: 0,
      lifetimeSeconds: 2,
      startedAt: 10,
    });

    expect(rocket.elapsedLifetimeSeconds).toBe(0);
    expect(rocket.isActive()).toBe(true);
    expect(rocket.isVisible()).toBe(true);
    expectVectorCloseTo(rocket.getPosition(), new Vector2(5, 6));
    expectVectorCloseTo(rocket.getVelocityVector(), new Vector2(0, -30));
  });

  it("should reject zero launch direction", () => {
    const rocket = createRocket();

    expect(() =>
      rocket.start({
        startPosition: new Vector2(0, 0),
        direction: new Vector2(0, 0),
        initialSpeed: 10,
        accelerationMagnitude: 0,
        lifetimeSeconds: 1,
        startedAt: 0,
      }),
    ).toThrow(RangeError);
  });
});

function createRocket(): Rocket {
  return new Rocket();
}

function expectVectorCloseTo(actual: Vector2, expected: Vector2): void {
  expect(actual.x).toBeCloseTo(expected.x);
  expect(actual.y).toBeCloseTo(expected.y);
}