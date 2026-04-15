import { describe, expect, it } from "vitest";

import { SampleTrackRequiresSampleIdSpecification } from "../src/specifications/SampleTrackRequiresSampleIdSpecification.js";
import {
  PatternBuilder,
  ProjectBuilder,
  SequencerProjectDocumentBuilder,
  TrackBuilder,
} from "./fixture/SequencerProjectDocumentBuilder.js";

describe("SampleTrackRequiresSampleIdSpecification", () => {
  it("Given a sample track with sampleId When isSatisfiedBy Then it returns true", () => {
    const sut = new SampleTrackRequiresSampleIdSpecification();
    const candidate = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder().withTracks([
            new TrackBuilder().withKind("sample").withSampleId("sample-1").build(),
          ]).build(),
        ]),
      )
      .build();

    expect(sut.isSatisfiedBy(candidate)).toBe(true);
  });

  it("Given a sample track without sampleId When isSatisfiedBy Then it returns false", () => {
    const sut = new SampleTrackRequiresSampleIdSpecification();
    const invalidTrack = {
      ...new TrackBuilder().withKind("sample").build(),
      sampleId: undefined,
    };
    const candidate = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder().withTracks([invalidTrack]).build(),
        ]),
      )
      .build();

    expect(sut.isSatisfiedBy(candidate)).toBe(false);
  });
});
