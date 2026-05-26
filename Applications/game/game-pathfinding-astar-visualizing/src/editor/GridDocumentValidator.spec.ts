import { describe, expect, it } from "vitest";
import { GridDocumentValidator } from "./GridDocumentValidator.js";
import { AstarGridEditorFixture } from "./tests/fixtures/AstarGridEditorFixture.js";

describe("GridDocumentValidator", () => {
  const fixture = new AstarGridEditorFixture();

  it("should accept a valid grid document", () => {
    const validator = new GridDocumentValidator();

    const result = validator.validate(fixture.createValidDocument());

    expect(result).toStrictEqual({
      isValid: true,
      errors: [],
    });
  });

  it("should reject unsupported schemaVersion", () => {
    const validator = new GridDocumentValidator();
    const document = {
      ...fixture.createValidDocument(),
      schemaVersion: 999,
    };

    const result = validator.validate(document);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Unsupported grid document schemaVersion.");
  });

  it("should reject non-positive rows", () => {
    const validator = new GridDocumentValidator();
    const document = {
      ...fixture.createValidDocument(),
      rows: 0,
    };

    const result = validator.validate(document);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Grid rows must be a positive integer.");
  });

  it("should reject non-positive cols", () => {
    const validator = new GridDocumentValidator();
    const document = {
      ...fixture.createValidDocument(),
      cols: 0,
    };

    const result = validator.validate(document);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Grid cols must be a positive integer.");
  });

  it("should reject start outside grid", () => {
    const validator = new GridDocumentValidator();
    const document = {
      ...fixture.createValidDocument(),
      start: { row: 10, col: 0 },
    };

    const result = validator.validate(document);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Start coordinate is outside the grid.");
  });

  it("should reject goal outside grid", () => {
    const validator = new GridDocumentValidator();
    const document = {
      ...fixture.createValidDocument(),
      goal: { row: 0, col: 10 },
    };

    const result = validator.validate(document);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Goal coordinate is outside the grid.");
  });

  it("should reject wall outside grid", () => {
    const validator = new GridDocumentValidator();
    const document = {
      ...fixture.createValidDocument(),
      walls: [{ row: -1, col: 0 }],
    };

    const result = validator.validate(document);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Wall coordinate is outside the grid.");
  });

  it("should reject wall on start", () => {
    const validator = new GridDocumentValidator();
    const document = {
      ...fixture.createValidDocument(),
      walls: [{ row: 0, col: 0 }],
    };

    const result = validator.validate(document);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Wall cannot overlap the start coordinate.");
  });

  it("should reject wall on goal", () => {
    const validator = new GridDocumentValidator();
    const document = {
      ...fixture.createValidDocument(),
      walls: [{ row: 3, col: 3 }],
    };

    const result = validator.validate(document);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Wall cannot overlap the goal coordinate.");
  });

  it("should reject obstacle outside grid", () => {
    const validator = new GridDocumentValidator();
    const document = {
      ...fixture.createValidDocument(),
      obstacles: [
        {
          ...fixture.createObstacle(),
          cells: [{ row: 99, col: 99 }],
        },
      ],
    };

    const result = validator.validate(document);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Obstacle coordinate is outside the grid.");
  });

  it("should reject obstacle on start", () => {
    const validator = new GridDocumentValidator();
    const document = {
      ...fixture.createValidDocument(),
      obstacles: [
        {
          ...fixture.createObstacle(),
          origin: { row: 0, col: 0 },
          cells: [{ row: 0, col: 0 }],
        },
      ],
    };

    const result = validator.validate(document);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Obstacle cannot overlap the start coordinate.");
  });

  it("should reject obstacle on goal", () => {
    const validator = new GridDocumentValidator();
    const document = {
      ...fixture.createValidDocument(),
      obstacles: [
        {
          ...fixture.createObstacle(),
          origin: { row: 3, col: 3 },
          cells: [{ row: 3, col: 3 }],
        },
      ],
    };

    const result = validator.validate(document);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Obstacle cannot overlap the goal coordinate.");
  });

  it("should reject duplicate obstacle id", () => {
    const validator = new GridDocumentValidator();
    const document = {
      ...fixture.createValidDocument(),
      obstacles: [
        fixture.createObstacle("duplicate-id", 1, 2),
        fixture.createObstacle("duplicate-id", 2, 2),
      ],
    };

    const result = validator.validate(document);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Obstacle ids must be unique.");
  });
});
