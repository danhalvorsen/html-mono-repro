import { describe, expect, it } from "vitest";
import { ObstaclePlacementPolicy } from "./ObstaclePlacementPolicy.js";
import { AstarGridEditorFixture } from "./tests/fixtures/AstarGridEditorFixture.js";

describe("ObstaclePlacementPolicy", () => {
  const fixture = new AstarGridEditorFixture();

  it("should accept obstacle placement inside the grid", () => {
    const policy = new ObstaclePlacementPolicy();
    const document = fixture.createDocumentWithoutObstacles();

    const result = policy.canPlace(document, fixture.createObstacle("obstacle-1", 1, 1));

    expect(result).toStrictEqual({
      canPlace: true,
      reason: null,
    });
  });

  it("should reject obstacle placement outside the grid", () => {
    const policy = new ObstaclePlacementPolicy();
    const document = fixture.createDocumentWithoutObstacles();

    const result = policy.canPlace(document, fixture.createObstacle("obstacle-1", 10, 10));

    expect(result).toStrictEqual({
      canPlace: false,
      reason: "Obstacle coordinate is outside the grid.",
    });
  });

  it("should reject obstacle placement on start", () => {
    const policy = new ObstaclePlacementPolicy();
    const document = fixture.createDocumentWithoutObstacles();

    const result = policy.canPlace(document, fixture.createObstacle("obstacle-1", 0, 0));

    expect(result).toStrictEqual({
      canPlace: false,
      reason: "Obstacle cannot overlap the start coordinate.",
    });
  });

  it("should reject obstacle placement on goal", () => {
    const policy = new ObstaclePlacementPolicy();
    const document = fixture.createDocumentWithoutObstacles();

    const result = policy.canPlace(document, fixture.createObstacle("obstacle-1", 3, 3));

    expect(result).toStrictEqual({
      canPlace: false,
      reason: "Obstacle cannot overlap the goal coordinate.",
    });
  });
});
