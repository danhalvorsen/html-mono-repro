// @vitest-environment jsdom

import { Vector2 } from "@monorepo/core-math";
import { describe, expect, it } from "vitest";

import { CollisionDetection } from "../src/collision/CollisionDetection.ts";
import { CollisionObject } from "../src/collision/CollisionObject.ts";
import { BouncingMovementStrategy } from "../src/moveable/BouncingMovementStrategy.ts";
import { DirectionalMovementPlan } from "../src/moveable/DirectionalMovementPlan.ts";
import { GravityFallingMovementStrategy } from "../src/moveable/GravityFallingMovementStrategy.ts";

describe("Movement strategies", () => {
  it("should move gravity falling object using velocity and acceleration", () => {
    const strategy = new GravityFallingMovementStrategy();

    strategy.container = new CollisionObject(
      new Vector2(0, 0),
      new Vector2(100, 100),
    );

    strategy.size = new Vector2(10, 10);
    strategy.movementPlan = new DirectionalMovementPlan(
      new Vector2(0, 1),
      0,
      10,
    );

    strategy.calculate(1);

    expect(strategy.position.x).toBe(45);
    expect(strategy.position.y).toBe(9);
    expect(strategy.velocity.y).toBe(10);
    expect(strategy.direction).toEqual(new Vector2(0, 1));
    expect(strategy.isCompleted).toBe(false);
  });

  it("should complete gravity falling object when it reaches the end edge", () => {
    const strategy = new GravityFallingMovementStrategy();

    strategy.container = new CollisionObject(
      new Vector2(0, 0),
      new Vector2(100, 20),
    );

    strategy.size = new Vector2(10, 10);
    strategy.movementPlan = new DirectionalMovementPlan(
      new Vector2(0, 1),
      0,
      100,
    );

    strategy.calculate(1);

    expect(strategy.isCompleted).toBe(true);
  });

  it("should invert velocity and direction when bouncing on a horizontal edge", () => {
    const strategy = new BouncingMovementStrategy();

    strategy.container = new CollisionObject(
      new Vector2(0, 0),
      new Vector2(100, 100),
    );

    strategy.collisionDetection = new CollisionDetection();
    strategy.size = new Vector2(10, 10);
    strategy.position = new Vector2(89, 40);
    strategy.initialVelocity = new Vector2(20, 0);
    strategy.velocity = new Vector2(20, 0);
    strategy.direction = new Vector2(1, 0);

    strategy.calculate(1);

    expect(strategy.position.x).toBe(90);
    expect(strategy.velocity.x).toBe(-20);
    expect(strategy.direction).toEqual(new Vector2(-1, 0));
  });
});
