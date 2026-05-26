import { describe, expect, it } from "vitest";
import { GridEditingController } from "./GridEditingController.js";
import { GridDocumentToSnapshotMapper } from "./GridDocumentToSnapshotMapper.js";
import { ObstaclePlacementPolicy } from "./ObstaclePlacementPolicy.js";
import { AstarGridEditorFixture } from "./tests/fixtures/AstarGridEditorFixture.js";

describe("GridEditingController", () => {
  const fixture = new AstarGridEditorFixture();

  it("should apply obstacle placement immutably", () => {
    const controller = new GridEditingController(
      new ObstaclePlacementPolicy(),
      new GridDocumentToSnapshotMapper(),
    );

    const document = fixture.createDocumentWithoutObstacles();
    const obstacle = fixture.createObstacle("obstacle-1", 1, 1);

    const result = controller.placeObstacle(document, obstacle);

    expect(result.isChanged).toBe(true);
    expect(result.document).not.toBe(document);
    expect(result.document.obstacles).toStrictEqual([obstacle]);
    expect(document.obstacles).toStrictEqual([]);
    expect(result.snapshot[1]?.[1]).toMatchObject({
      obstacleType: "wall",
    });
  });

  it("should reject invalid obstacle placement without mutation", () => {
    const controller = new GridEditingController(
      new ObstaclePlacementPolicy(),
      new GridDocumentToSnapshotMapper(),
    );

    const document = fixture.createDocumentWithoutObstacles();
    const obstacle = fixture.createObstacle("obstacle-1", 0, 0);

    const result = controller.placeObstacle(document, obstacle);

    expect(result).toStrictEqual({
      isChanged: false,
      reason: "Obstacle cannot overlap the start coordinate.",
      document,
      snapshot: null,
    });
  });

  it("should load a valid document and return a derived snapshot", () => {
    const controller = new GridEditingController(
      new ObstaclePlacementPolicy(),
      new GridDocumentToSnapshotMapper(),
    );

    const document = fixture.createValidDocument();

    const result = controller.loadDocument(document);

    expect(result.isChanged).toBe(true);
    expect(result.document).toStrictEqual(document);
    expect(result.snapshot?.[0]?.[0]).toMatchObject({ role: "start" });
    expect(result.snapshot?.[3]?.[3]).toMatchObject({ role: "goal" });
  });
});
