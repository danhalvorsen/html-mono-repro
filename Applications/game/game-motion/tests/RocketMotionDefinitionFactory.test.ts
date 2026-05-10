import { describe, it } from "vitest";
import { MovableObjectDefinitionResolver } from "../src/MovableObjectDefinitionResolver";
import { ParametricMotion } from "../src/ParametricMotion";
import { RocketMotionDefinitionFactory } from "../src/RocketMotionDefinitionFactory";
import { MotionTestFixture } from "./fixtures/MotionTestFixture";

describe("RocketMotionDefinitionFactory", () => {
  const fixture = new MotionTestFixture();

  it("should create burn and burnout acceleration segments", () => {
    const definition = new RocketMotionDefinitionFactory().create({
      structure: {
        kind: "rocket",
      },

      body: {
        mass: 2,
      },

      initialConditions: {
        origin: { x: 0, y: 0 },

        velocity: {
          speed: 10,
          normalizedDirection: { x: 1, y: 0 },
        },
      },

      special: {
        gravity: { x: 0, y: 10 },

        thrust: {
          normalizedDirection: { x: 0, y: -1 },
          force: [[0, 20]],
        },

        fuel: {
          burnDurationSeconds: 1,
        },
      },
    });

    const resolved = new MovableObjectDefinitionResolver().resolve(definition);
    const motion = new ParametricMotion(resolved.math);

    const burnEnd = motion.evaluateAt(1);
    const afterBurn = motion.evaluateAt(2);

    fixture.assertVectorClose(burnEnd.coordinate, { x: 10, y: 0 });
    fixture.assertVectorClose(burnEnd.velocity, { x: 10, y: 0 });
    fixture.assertVectorClose(burnEnd.acceleration, { x: 0, y: 10 });

    fixture.assertVectorClose(afterBurn.coordinate, { x: 20, y: 5 });
    fixture.assertVectorClose(afterBurn.velocity, { x: 10, y: 10 });
    fixture.assertVectorClose(afterBurn.acceleration, { x: 0, y: 10 });
  });

  it("should preserve generic structure and rocket special options", () => {
    const definition = new RocketMotionDefinitionFactory().create({
      structure: {
        collisionShapeId: "rocket-polygon",
      },

      body: {
        mass: 1,
      },

      initialConditions: {
        origin: { x: 0, y: 0 },

        velocity: {
          speed: 0,
          normalizedDirection: { x: 1, y: 0 },
        },
      },

      special: {
        gravity: { x: 0, y: 10 },
        thrust: {
          normalizedDirection: { x: 1, y: 0 },
          force: [[0, 10]],
        },
        fuel: {
          burnDurationSeconds: 1,
        },
      },
    });

    const resolved = new MovableObjectDefinitionResolver().resolve(definition);

    resolved.structure.collisionShapeId.should.equal("rocket-polygon");
    resolved.special.fuel.burnDurationSeconds.should.equal(1);
    resolved.math.coordinateSegments.length.should.equal(2);
  });
});

