import { describe, expect, it } from "vitest";

import { SequencerProjectSemanticSpecification } from "../src/specifications/SequencerProjectSemanticSpecification.js";
import {
  PatternBuilder,
  ProjectBuilder,
  ProjectComponentsBuilder,
  SampleComponentBuilder,
  SequencerProjectDocumentBuilder,
  StepBuilder,
  TrackBuilder,
} from "./fixture/SequencerProjectDocumentBuilder.js";

describe("SequencerProjectSemanticSpecification", () => {
  it("Given a semantically consistent project When isSatisfiedBy Then chained specifications return true", () => {
    const sut = new SequencerProjectSemanticSpecification();
    const candidate = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder()
          .withActivePatternId("pattern-2")
          .withComponents(
            new ProjectComponentsBuilder().withSamples([
              new SampleComponentBuilder().withId("sample-2").build(),
            ]),
          )
          .withPatterns([
            new PatternBuilder().withId("pattern-1").build(),
            new PatternBuilder()
              .withId("pattern-2")
              .withStepCount(8)
              .withTracks([
                new TrackBuilder()
                  .withSampleId("sample-2")
                  .withHits([new StepBuilder().withStep(8).build()])
                  .build(),
              ])
              .build(),
          ]),
      )
      .build();

    const result = sut.isSatisfiedBy(candidate);

    expect(result).toBe(true);
  });

  it("Given any chained semantic invariant fails When isSatisfiedBy Then it returns false", () => {
    const sut = new SequencerProjectSemanticSpecification();
    const candidate = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder()
          .withActivePatternId("missing-pattern")
          .withComponents(
            new ProjectComponentsBuilder().withSamples([
              new SampleComponentBuilder().withId("sample-1").build(),
            ]),
          )
          .withPatterns([
            new PatternBuilder()
              .withStepCount(4)
              .withTracks([
                new TrackBuilder()
                  .withSampleId("missing-sample")
                  .withHits([new StepBuilder().withStep(5).build()])
                  .build(),
              ])
              .build(),
          ]),
      )
      .build();

    const result = sut.isSatisfiedBy(candidate);

    expect(result).toBe(false);
  });
});
