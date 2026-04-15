import { describe, expect, it } from "vitest";

import { ActivePatternExistsSpecification } from "../src/specifications/ActivePatternExistsSpecification.js";
import {
  PatternBuilder,
  ProjectBuilder,
  SequencerProjectDocumentBuilder,
} from "./fixture/SequencerProjectDocumentBuilder.js";

describe("ActivePatternExistsSpecification", () => {
  it("Given activePatternId matching a pattern id When isSatisfiedBy Then it returns true", () => {
    const sut = new ActivePatternExistsSpecification();
    const candidate = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder().withId("pattern-1").build(),
          new PatternBuilder().withId("pattern-2").build(),
        ]),
      )
      .build();

    const result = sut.isSatisfiedBy(candidate);

    expect(result).toBe(true);
  });

  it("Given activePatternId not matching any pattern id When isSatisfiedBy Then it returns false", () => {
    const sut = new ActivePatternExistsSpecification();
    const candidate = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder()
          .withActivePatternId("missing-pattern")
          .withPatterns([
            new PatternBuilder().withId("pattern-1").build(),
            new PatternBuilder().withId("pattern-2").build(),
          ]),
      )
      .build();

    const result = sut.isSatisfiedBy(candidate);

    expect(result).toBe(false);
  });
});
