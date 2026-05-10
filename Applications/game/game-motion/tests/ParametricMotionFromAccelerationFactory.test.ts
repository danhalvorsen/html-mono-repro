import { describe, it } from "vitest";
import { MotionTestFixture } from "./fixtures/MotionTestFixture";

describe("ParametricMotionFromAccelerationFactory", () => {
  const fixture = new MotionTestFixture();

  it("should generate x(t) and y(t) from constant acceleration and initial conditions", () => {
    const motion = fixture.createMotionFromPhysicalDefinition({
      body: {
        mass: 1,
      },

      initialConditions: {
        origin: { x: 40, y: 260 },

        velocity: {
          speed: 10,
          normalizedDirection: { x: 1, y: 0 },
        },
      },

      accelerationProfile: {
        accelerationSegments: [
          {
            startsAtSeconds: 0,
            acceleration: {
              x: [[0, 0]],
              y: [[0, 10]],
            },
          },
        ],
      },
    });

    const point = motion.evaluateAt(2);

    fixture.assertVectorClose(point.coordinate, { x: 60, y: 280 });
    fixture.assertVectorClose(point.velocity, { x: 10, y: 20 });
    fixture.assertVectorClose(point.acceleration, { x: 0, y: 10 });
  });

  it("should preserve continuity across acceleration segments", () => {
    const motion = fixture.createMotionFromPhysicalDefinition({
      body: {
        mass: 1,
      },

      initialConditions: {
        origin: { x: 0, y: 0 },

        velocity: {
          speed: 10,
          normalizedDirection: { x: 1, y: 0 },
        },
      },

      accelerationProfile: {
        accelerationSegments: [
          {
            startsAtSeconds: 0,
            acceleration: {
              x: [[0, 0]],
              y: [[0, 0]],
            },
          },
          {
            startsAtSeconds: 1,
            acceleration: {
              x: [[0, 0]],
              y: [[0, 10]],
            },
          },
        ],
      },
    });

    const point = motion.evaluateAt(2);

    fixture.assertVectorClose(point.coordinate, { x: 20, y: 5 });
    fixture.assertVectorClose(point.velocity, { x: 10, y: 10 });
    fixture.assertVectorClose(point.acceleration, { x: 0, y: 10 });
  });

  it("should support time-varying acceleration", () => {
    const motion = fixture.createMotionFromPhysicalDefinition({
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

      accelerationProfile: {
        accelerationSegments: [
          {
            startsAtSeconds: 0,
            acceleration: {
              x: [
                [1, 6],
              ],
              y: [[0, 0]],
            },
          },
        ],
      },
    });

    const point = motion.evaluateAt(2);

    fixture.assertVectorClose(point.acceleration, { x: 12, y: 0 });
    fixture.assertVectorClose(point.velocity, { x: 12, y: 0 });
    fixture.assertVectorClose(point.coordinate, { x: 8, y: 0 });
  });
});
