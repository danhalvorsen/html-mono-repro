import { describe, expect, it } from "vitest";

import { CreatedAtBeforeUpdatedAtSpecification } from "../src/specifications/CreatedAtBeforeUpdatedAtSpecification.js";
import {
  ProjectBuilder,
  SequencerProjectDocumentBuilder,
} from "./fixture/SequencerProjectDocumentBuilder.js";

describe("CreatedAtBeforeUpdatedAtSpecification", () => {
  it("Given one or both timestamps are omitted When isSatisfiedBy Then it returns true", () => {
    const sut = new CreatedAtBeforeUpdatedAtSpecification();
    const candidate = new SequencerProjectDocumentBuilder()
      .withProject(new ProjectBuilder().withCreatedAt("2024-01-01T00:00:00.000Z"))
      .build();

    expect(sut.isSatisfiedBy(candidate)).toBe(true);
  });

  it("Given createdAt is before updatedAt When isSatisfiedBy Then it returns true", () => {
    const sut = new CreatedAtBeforeUpdatedAtSpecification();
    const candidate = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder()
          .withCreatedAt("2024-01-01T00:00:00.000Z")
          .withUpdatedAt("2024-01-02T00:00:00.000Z"),
      )
      .build();

    expect(sut.isSatisfiedBy(candidate)).toBe(true);
  });

  it("Given createdAt is after updatedAt When isSatisfiedBy Then it returns false", () => {
    const sut = new CreatedAtBeforeUpdatedAtSpecification();
    const candidate = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder()
          .withCreatedAt("2024-01-03T00:00:00.000Z")
          .withUpdatedAt("2024-01-02T00:00:00.000Z"),
      )
      .build();

    expect(sut.isSatisfiedBy(candidate)).toBe(false);
  });
});
