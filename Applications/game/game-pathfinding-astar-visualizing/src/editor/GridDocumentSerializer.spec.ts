import { describe, expect, it } from "vitest";
import { AstarGridEditorFixture } from '../../tests/tests/fixtures/AstarGridEditorFixture';
 
describe("GridDocumentSerializer", () => {
  const fixture = new AstarGridEditorFixture();

  it("should serialize start, goal, walls, and obstacle metadata", () => {
    const serializer = new GridDocumentSerializer();

    const json = serializer.serialize(fixture.createValidDocument());
    const parsed = JSON.parse(json);

    expect(parsed).toStrictEqual({
      schemaVersion: 1,
      rows: 4,
      cols: 4,
      start: { row: 0, col: 0 },
      goal: { row: 3, col: 3 },
      walls: [{ row: 1, col: 1 }],
      obstacles: [
        {
          id: "slow-zone-1",
          obstacleType: "slow-zone",
          origin: { row: 2, col: 1 },
          cells: [{ row: 2, col: 1 }],
          metadata: {
            movementCost: 5,
            blocksMovement: false,
            label: "Mud",
          },
        },
      ],
    });
  });

  it("should serialize deterministically", () => {
    const serializer = new GridDocumentSerializer();
    const document = fixture.createValidDocument();

    const first = serializer.serialize(document);
    const second = serializer.serialize(document);

    expect(second).toBe(first);
  });

  it("should not serialize transient algorithm state", () => {
    const serializer = new GridDocumentSerializer();

    const json = serializer.serialize(fixture.createValidDocument());

    expect(json).not.toContain("visitState");
    expect(json).not.toContain("open");
    expect(json).not.toContain("closed");
    expect(json).not.toContain("path");
    expect(json).not.toContain('"g"');
    expect(json).not.toContain('"h"');
    expect(json).not.toContain('"f"');
    expect(json).not.toContain("parentDirection");
  });
});
