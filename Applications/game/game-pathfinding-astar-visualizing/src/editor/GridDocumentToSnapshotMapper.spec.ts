import { describe, expect, it } from "vitest";
import { GridDocumentToSnapshotMapper } from "./GridDocumentToSnapshotMapper.js";
import { AstarGridEditorFixture } from "./tests/fixtures/AstarGridEditorFixture.js";

describe("GridDocumentToSnapshotMapper", () => {
  const fixture = new AstarGridEditorFixture();

  it("should map start and goal coordinates to cell roles", () => {
    const mapper = new GridDocumentToSnapshotMapper();

    const snapshot = mapper.map(fixture.createValidDocument());

    expect(snapshot[0]?.[0]).toMatchObject({ role: "start" });
    expect(snapshot[3]?.[3]).toMatchObject({ role: "goal" });
  });

  it("should map walls to wall cell roles", () => {
    const mapper = new GridDocumentToSnapshotMapper();

    const snapshot = mapper.map(fixture.createValidDocument());

    expect(snapshot[1]?.[1]).toMatchObject({ role: "wall" });
  });

  it("should map obstacle type to affected cells", () => {
    const mapper = new GridDocumentToSnapshotMapper();

    const snapshot = mapper.map(fixture.createValidDocument());

    expect(snapshot[2]?.[1]).toMatchObject({
      obstacleType: "slow-zone",
    });
  });

  it("should map obstacle metadata to affected cells", () => {
    const mapper = new GridDocumentToSnapshotMapper();

    const snapshot = mapper.map(fixture.createValidDocument());

    expect(snapshot[2]?.[1]).toMatchObject({
      obstacleMetadata: {
        movementCost: 5,
        blocksMovement: false,
        label: "Mud",
      },
    });
  });

  it("should not create transient algorithm state from a document", () => {
    const mapper = new GridDocumentToSnapshotMapper();

    const snapshot = mapper.map(fixture.createValidDocument());

    for (const row of snapshot) {
      for (const cell of row) {
        expect(cell.visitState).toBe("unvisited");
        expect(cell.g).toBeNull();
        expect(cell.h).toBeNull();
        expect(cell.f).toBeNull();
        expect(cell.parentDirection).toBeNull();
      }
    }
  });
});
