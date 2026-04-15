import { describe, expect, it } from "vitest";

import { ReferencedSamplesExistSpecification } from "../src/specifications/ReferencedSamplesExistSpecification.js";
import {
  PatternBuilder,
  ProjectBuilder,
  ProjectComponentsBuilder,
  SampleComponentBuilder,
  SequencerProjectDocumentBuilder,
  TrackBuilder,
} from "./fixture/SequencerProjectDocumentBuilder.js";

describe("ReferencedSamplesExistSpecification", () => {
  it("Given sample tracks reference existing samples When isSatisfiedBy Then it returns true", () => {
    const sut = new ReferencedSamplesExistSpecification();
    const candidate = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder()
          .withComponents(
            new ProjectComponentsBuilder().withSamples([
              new SampleComponentBuilder().withId("sample-1").build(),
              new SampleComponentBuilder().withId("sample-2").build(),
            ]),
          )
          .withPatterns([
            new PatternBuilder().withTracks([
              new TrackBuilder().withSampleId("sample-2").build(),
            ]).build(),
          ]),
      )
      .build();

    const result = sut.isSatisfiedBy(candidate);

    expect(result).toBe(true);
  });

  it("Given a sample track references a missing sample When isSatisfiedBy Then it returns false", () => {
    const sut = new ReferencedSamplesExistSpecification();
    const candidate = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder()
          .withComponents(
            new ProjectComponentsBuilder().withSamples([
              new SampleComponentBuilder().withId("sample-1").build(),
            ]),
          )
          .withPatterns([
            new PatternBuilder().withTracks([
              new TrackBuilder().withSampleId("missing-sample").build(),
            ]).build(),
          ]),
      )
      .build();

    const result = sut.isSatisfiedBy(candidate);

    expect(result).toBe(false);
  });
});
