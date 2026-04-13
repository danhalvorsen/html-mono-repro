import { describe, expect, it } from "vitest";

import { MidiTrackMustNotReferenceSampleIdSpecification } from "../src/specifications/MidiTrackMustNotReferenceSampleIdSpecification.js";
import {
  PatternBuilder,
  ProjectBuilder,
  SequencerProjectDocumentBuilder,
  TrackBuilder,
} from "./fixture/SequencerProjectDocumentBuilder.js";

describe("MidiTrackMustNotReferenceSampleIdSpecification", () => {
  it("Given a midi track without sampleId When isSatisfiedBy Then it returns true", () => {
    const sut = new MidiTrackMustNotReferenceSampleIdSpecification();
    const validTrack = {
      ...new TrackBuilder().withKind("midi").build(),
      sampleId: undefined,
    };
    const candidate = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder().withTracks([validTrack]).build(),
        ]),
      )
      .build();

    expect(sut.isSatisfiedBy(candidate)).toBe(true);
  });

  it("Given a midi track with sampleId When isSatisfiedBy Then it returns false", () => {
    const sut = new MidiTrackMustNotReferenceSampleIdSpecification();
    const candidate = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder().withTracks([
            new TrackBuilder().withKind("midi").withSampleId("sample-1").build(),
          ]).build(),
        ]),
      )
      .build();

    expect(sut.isSatisfiedBy(candidate)).toBe(false);
  });
});
