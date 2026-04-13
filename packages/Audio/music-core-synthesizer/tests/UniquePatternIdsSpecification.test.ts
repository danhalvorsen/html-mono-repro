import { describe, expect, it } from "vitest";

import { UniquePatternIdsSpecification } from "../src/specifications/UniquePatternIdsSpecification.js";
import {
  PatternBuilder,
  ProjectBuilder,
  SequencerProjectDocumentBuilder,
} from "./fixture/SequencerProjectDocumentBuilder.js";

describe("UniquePatternIdsSpecification", () => {
  it("Given unique pattern ids When isSatisfiedBy Then it returns true", () => {
    const sut = new UniquePatternIdsSpecification();
    const candidate = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder().withId("pattern-1").build(),
          new PatternBuilder().withId("pattern-2").build(),
        ]),
      )
      .build();

    expect(sut.isSatisfiedBy(candidate)).toBe(true);
  });

  it("Given duplicate pattern ids When isSatisfiedBy Then it returns false", () => {
    const sut = new UniquePatternIdsSpecification();
    const candidate = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder().withId("pattern-1").build(),
          new PatternBuilder().withId("pattern-1").build(),
        ]),
      )
      .build();

    expect(sut.isSatisfiedBy(candidate)).toBe(false);
  });
});
