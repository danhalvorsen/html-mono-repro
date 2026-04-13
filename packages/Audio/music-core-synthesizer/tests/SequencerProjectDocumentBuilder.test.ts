// packages/Audio/music-core-synthesizer/tests/SequencerProjectDocumentBuilder.test.ts

import { describe, expect, it } from "vitest";

import {
  PatternBuilder,
  ProjectBuilder,
  SequencerProjectDocumentBuilder,
  TrackBuilder,
} from "./fixture/SequencerProjectDocumentBuilder.js";

describe("SequencerProjectDocumentBuilder", () => {
  it("Given non power of two step count When buildJson Then generated document contains the requested step count", () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withStepCount(12)
            .withTracks([new TrackBuilder().build()])
            .build(),
        ]),
      )
      .buildJson();

    const document = JSON.parse(json) as {
      readonly project: {
        readonly patterns: ReadonlyArray<{
          readonly stepCount: number;
        }>;
      };
    };

    expect(document.project.patterns[0]?.stepCount).toBe(12);
  });

  it("Given project id removed When buildJson Then generated document does not contain projectId", () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(new ProjectBuilder().withoutProjectId())
      .buildJson();

    const document = JSON.parse(json) as {
      readonly project: Record<string, unknown>;
    };

    expect("projectId" in document.project).toBe(false);
  });

  it("Given additional track property When buildJson Then generated document contains the unexpected property", () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTracks([
              new TrackBuilder()
                .withAdditionalProperty("unexpectedProperty", true)
                .build(),
            ])
            .build(),
        ]),
      )
      .buildJson();

    const document = JSON.parse(json) as {
      readonly project: {
        readonly patterns: ReadonlyArray<{
          readonly tracks: ReadonlyArray<Record<string, unknown>>;
        }>;
      };
    };

    expect(
      document.project.patterns[0]?.tracks[0]?.["unexpectedProperty"],
    ).toBe(true);
  });
});