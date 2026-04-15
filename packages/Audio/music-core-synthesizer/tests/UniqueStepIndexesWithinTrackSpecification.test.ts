import { describe, expect, it } from "vitest";

import { UniqueStepIndexesWithinTrackSpecification } from "../src/specifications/UniqueStepIndexesWithinTrackSpecification.js";
import {
  PatternBuilder,
  ProjectBuilder,
  SequencerProjectDocumentBuilder,
  StepBuilder,
  TrackBuilder,
} from "./fixture/SequencerProjectDocumentBuilder.js";

describe("UniqueStepIndexesWithinTrackSpecification", () => {
  it("Given unique step indexes within a track When isSatisfiedBy Then it returns true", () => {
    const sut = new UniqueStepIndexesWithinTrackSpecification();
    const candidate = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder().withTracks([
            new TrackBuilder().withHits([
              new StepBuilder().withStep(1).build(),
              new StepBuilder().withStep(2).build(),
            ]).build(),
          ]).build(),
        ]),
      )
      .build();

    expect(sut.isSatisfiedBy(candidate)).toBe(true);
  });

  it("Given duplicate step indexes within a track When isSatisfiedBy Then it returns false", () => {
    const sut = new UniqueStepIndexesWithinTrackSpecification();
    const candidate = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder().withTracks([
            new TrackBuilder().withHits([
              new StepBuilder().withStep(1).build(),
              new StepBuilder().withStep(1).build(),
            ]).build(),
          ]).build(),
        ]),
      )
      .build();

    expect(sut.isSatisfiedBy(candidate)).toBe(false);
  });
});
