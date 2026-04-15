import { describe, expect, it } from "vitest";

import { StepsWithinPatternBoundsSpecification } from "../src/specifications/StepsWithinPatternBoundsSpecification.js";
import {
  PatternBuilder,
  ProjectBuilder,
  SequencerProjectDocumentBuilder,
  StepBuilder,
  TrackBuilder,
} from "./fixture/SequencerProjectDocumentBuilder.js";

describe("StepsWithinPatternBoundsSpecification", () => {
  it("Given all step indexes fit within the pattern step count When isSatisfiedBy Then it returns true", () => {
    const sut = new StepsWithinPatternBoundsSpecification();
    const candidate = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withStepCount(16)
            .withTracks([
              new TrackBuilder().withHits([
                new StepBuilder().withStep(1).build(),
                new StepBuilder().withStep(16).build(),
              ]).build(),
            ])
            .build(),
        ]),
      )
      .build();

    const result = sut.isSatisfiedBy(candidate);

    expect(result).toBe(true);
  });

  it("Given a step index exceeds the pattern step count When isSatisfiedBy Then it returns false", () => {
    const sut = new StepsWithinPatternBoundsSpecification();
    const candidate = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withStepCount(8)
            .withTracks([
              new TrackBuilder().withHits([
                new StepBuilder().withStep(9).build(),
              ]).build(),
            ])
            .build(),
        ]),
      )
      .build();

    const result = sut.isSatisfiedBy(candidate);

    expect(result).toBe(false);
  });
});
