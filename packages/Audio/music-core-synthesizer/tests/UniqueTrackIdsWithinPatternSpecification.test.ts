import { describe, expect, it } from "vitest";

import { UniqueTrackIdsWithinPatternSpecification } from "../src/specifications/UniqueTrackIdsWithinPatternSpecification.js";
import {
  PatternBuilder,
  ProjectBuilder,
  SequencerProjectDocumentBuilder,
  TrackBuilder,
} from "./fixture/SequencerProjectDocumentBuilder.js";

describe("UniqueTrackIdsWithinPatternSpecification", () => {
  it("Given unique track ids within each pattern When isSatisfiedBy Then it returns true", () => {
    const sut = new UniqueTrackIdsWithinPatternSpecification();
    const candidate = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder().withTracks([
            new TrackBuilder().withId("track-1").build(),
            new TrackBuilder().withId("track-2").build(),
          ]).build(),
        ]),
      )
      .build();

    expect(sut.isSatisfiedBy(candidate)).toBe(true);
  });

  it("Given duplicate track ids within a pattern When isSatisfiedBy Then it returns false", () => {
    const sut = new UniqueTrackIdsWithinPatternSpecification();
    const candidate = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder().withTracks([
            new TrackBuilder().withId("track-1").build(),
            new TrackBuilder().withId("track-1").build(),
          ]).build(),
        ]),
      )
      .build();

    expect(sut.isSatisfiedBy(candidate)).toBe(false);
  });
});
