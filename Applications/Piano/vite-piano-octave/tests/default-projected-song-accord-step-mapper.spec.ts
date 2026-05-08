import { describe, expect, it } from "vitest";
import { DefaultProjectedSongAccordStepMapper } from "../src/application/DefaultProjectedSongAccordStepMapper";
import type { ProjectedSongStep } from "../src/application/MidiSongProjector";

describe("DefaultProjectedSongAccordStepMapper", () => {
  it("should map and sort steps per octave into accord steps", () => {
    const mapper = new DefaultProjectedSongAccordStepMapper();

    const song: readonly ProjectedSongStep[] = [
      { octaveIndex: 1, note: "G", startMs: 900, holdMs: 300 },
      { octaveIndex: 0, note: "C", startMs: 500, holdMs: 200 },
      { octaveIndex: 1, note: "E", startMs: 200, holdMs: 180 }
    ];

    const mapped = mapper.mapByOctave(song, 1);

    expect(mapped).toEqual([
      { notes: ["E"], waitBeforeMs: 200, holdMs: 180 },
      { notes: ["G"], waitBeforeMs: 700, holdMs: 300 }
    ]);
  });
});

