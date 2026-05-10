import { describe, it } from "vitest";
import { LaserMotionDefinitionFactory } from "../src/LaserMotionDefinitionFactory";
import { MovableObjectDefinitionResolver } from "../src/MovableObjectDefinitionResolver";
import { ParametricMotion } from "../src/ParametricMotion";
import { Vector2 } from '@monorepo/core-math'
import { MotionTestFixture } from "./fixtures/MotionTestFixture";

describe("LaserMotionDefinitionFactory", () => {
  const fixture = new MotionTestFixture();

  it("should create linear motion from initial velocity without acceleration", () => {
    const definition = new LaserMotionDefinitionFactory().create({
      structure: {
        kind: "laser",
      },

      body: {
        mass: 1,
      },

      initialConditions: {
        origin: new Vector2(10, 20),

        velocity: {
          speed: 100,
          normalizedDirection: new Vector2(1, 0),
        },
      },

      special: {
        damage: 10,
        lifeTimeSeconds: 0.35,
      },
    });

    const resolved = new MovableObjectDefinitionResolver().resolve(definition);
    const motion = new ParametricMotion(resolved.math);

    const point = motion.evaluateAt(0.25);

    fixture.assertVectorClose(point.coordinate, { x: 35, y: 20 });
    fixture.assertVectorClose(point.velocity, { x: 100, y: 0 });
    fixture.assertVectorClose(point.acceleration, { x: 0, y: 0 });
  });
});
