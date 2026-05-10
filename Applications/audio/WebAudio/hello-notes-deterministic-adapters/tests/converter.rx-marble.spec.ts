import { describe, it } from "vitest";
import { TestScheduler } from "rxjs/testing";
import type { MidiLogicalEvent } from "@monorepo/music-core-midi-accords-playback";

import { abcFromEvents$, noteNotationFromEvents$ } from "../src/index.js";

describe("Converter RxJS marble schema", () => {
  it("converts note-on event stream to note-notation deterministically", () => {
    const scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    scheduler.run(({ cold, expectObservable }) => {
      const events = {
        a: createNoteOn(0, 60, 92, 500),
        b: createNoteOn(1, 60, 92, 500),
        c: createNoteOn(2, 67, 92, 1000),
      };
      const source$ = cold(" -a-b-c-|", events);

      const result$ = noteNotationFromEvents$(source$);
      expectObservable(result$).toBe("-------(x|)", {
        x: "C4-h500-v92-ch1 C4-h500-v92-ch1 G4-h1000-v92-ch1",
      });
    });
  });

  it("converts note-on event stream to ABCJS notation deterministically", () => {
    const scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    scheduler.run(({ cold, expectObservable }) => {
      const events = {
        a: createNoteOn(0, 60, 92, 500),
        b: createNoteOn(1, 60, 92, 500),
        c: createNoteOn(2, 67, 92, 1000),
      };
      const source$ = cold("-a-b-c-|", events);

      const result$ = abcFromEvents$(source$);
      expectObservable(result$).toBe("-------(x|)", {
        x: [
          "X:1",
          "T:Song",
          "M:4/4",
          "L:1/8",
          "Q:120",
          "K:C",
          "C2 C2 G4 |",
        ].join("\n"),
      });
    });
  });
});

function createNoteOn(
  sequence: number,
  noteNumber: number,
  velocity: number,
  durationMs: number,
): Extract<MidiLogicalEvent, { kind: "note-on" }> {
  return {
    kind: "note-on",
    absoluteTick: sequence * 480,
    timestampMs: sequence * 500,
    trackIndex: 0,
    sequence,
    rawBytes: [],
    status: 0x90,
    channel: 1,
    noteNumber,
    velocity,
    durationMs,
  };
}
