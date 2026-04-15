import { describe, expect, it } from "vitest";

import { UniqueStepIdsWithinTrackSpecification } from "../src/specifications/UniqueStepIdsWithinTrackSpecification.js";
import {
  PatternBuilder,
  ProjectBuilder,
  SequencerProjectDocumentBuilder,
  StepBuilder,
  TrackBuilder,
} from "./fixture/SequencerProjectDocumentBuilder.js";

describe("UniqueStepIdsWithinTrackSpecification", () => {
  it("Given unique step ids within a track When isSatisfiedBy Then it returns true", () => {
    const sut = new UniqueStepIdsWithinTrackSpecification();
    const candidate = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder().withTracks([
            new TrackBuilder().withHits([
              new StepBuilder().withId("step-1").build(),
              new StepBuilder().withId("step-2").build(),
            ]).build(),
          ]).build(),
        ]),
      )
      .build();

    expect(sut.isSatisfiedBy(candidate)).toBe(true);
  });

  it("Given duplicate step ids within a track When isSatisfiedBy Then it returns false", () => {
    const sut = new UniqueStepIdsWithinTrackSpecification();
    const candidate = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder().withTracks([
            new TrackBuilder().withHits([
              new StepBuilder().withId("step-1").build(),
              new StepBuilder().withId("step-1").build(),
            ]).build(),
          ]).build(),
        ]),
      )
      .build();

    expect(sut.isSatisfiedBy(candidate)).toBe(false);
  });
});
