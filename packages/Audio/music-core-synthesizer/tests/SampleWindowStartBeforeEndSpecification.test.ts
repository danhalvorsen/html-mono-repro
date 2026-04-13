import { describe, expect, it } from "vitest";

import { SampleWindowStartBeforeEndSpecification } from "../src/specifications/SampleWindowStartBeforeEndSpecification.js";
import {
  PatternBuilder,
  ProjectBuilder,
  SampleWindowBuilder,
  SequencerProjectDocumentBuilder,
  StepBuilder,
  TrackBuilder,
  TrackDefaultsBuilder,
} from "./fixture/SequencerProjectDocumentBuilder.js";

describe("SampleWindowStartBeforeEndSpecification", () => {
  it("Given sample windows are omitted or ordered correctly When isSatisfiedBy Then it returns true", () => {
    const sut = new SampleWindowStartBeforeEndSpecification();
    const candidate = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder().withTracks([
            new TrackBuilder()
              .withDefaults(
                new TrackDefaultsBuilder().withSampleWindow(
                  new SampleWindowBuilder().withStart(0.1).withEnd(0.9),
                ),
              )
              .withHits([
                new StepBuilder().withSampleWindow(
                  new SampleWindowBuilder().withStart(0.2).withEnd(0.8),
                ).build(),
              ])
              .build(),
          ]).build(),
        ]),
      )
      .build();

    expect(sut.isSatisfiedBy(candidate)).toBe(true);
  });

  it("Given a default sample window starts after it ends When isSatisfiedBy Then it returns false", () => {
    const sut = new SampleWindowStartBeforeEndSpecification();
    const candidate = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder().withTracks([
            new TrackBuilder()
              .withDefaults(
                new TrackDefaultsBuilder().withSampleWindow(
                  new SampleWindowBuilder().withStart(0.9).withEnd(0.1),
                ),
              )
              .build(),
          ]).build(),
        ]),
      )
      .build();

    expect(sut.isSatisfiedBy(candidate)).toBe(false);
  });

  it("Given a step sample window starts after it ends When isSatisfiedBy Then it returns false", () => {
    const sut = new SampleWindowStartBeforeEndSpecification();
    const candidate = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder().withTracks([
            new TrackBuilder().withHits([
              new StepBuilder().withSampleWindow(
                new SampleWindowBuilder().withStart(0.9).withEnd(0.1),
              ).build(),
            ]).build(),
          ]).build(),
        ]),
      )
      .build();

    expect(sut.isSatisfiedBy(candidate)).toBe(false);
  });
});
