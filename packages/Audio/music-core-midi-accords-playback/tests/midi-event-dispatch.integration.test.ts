import { describe, expect, it } from "vitest";

import { MidiEventEngine, MidiLogicalEventKind } from "../src/midi-event-engine.js";
import { EventDispatchFixture } from "./support/event-dispatch-fixture.js";
import { MidiBinarySongFromNotation, SongText } from "./support/song-fixtures.js";

describe("Midi event dispatch integration", () => {
  it("dispatches events to fixtures listening by kind and any-event", () => {
    const engine = new MidiEventEngine();
    const song = new MidiBinarySongFromNotation(new SongText());
    const events = engine.play(song);

    const dispatcher = new EventDispatchFixture();
    const anyKinds: string[] = [];
    const noteOnNotes: number[] = [];
    const noteOffNotes: number[] = [];
    const metaKinds: string[] = [];

    dispatcher.onAny((event) => {
      anyKinds.push(event.kind);
    });
    dispatcher.onKind(MidiLogicalEventKind.NoteOn, (event) => {
      if (event.kind === MidiLogicalEventKind.NoteOn) {
        noteOnNotes.push(event.noteNumber);
      }
    });
    dispatcher.onKind(MidiLogicalEventKind.NoteOff, (event) => {
      if (event.kind === MidiLogicalEventKind.NoteOff) {
        noteOffNotes.push(event.noteNumber);
      }
    });
    dispatcher.onKind(MidiLogicalEventKind.Meta, (event) => {
      if (event.kind === MidiLogicalEventKind.Meta) {
        if (event.metaKind !== undefined) {
          metaKinds.push(event.metaKind);
        }
      }
    });

    dispatcher.dispatch(events);

    expect(anyKinds).toHaveLength(events.length);
    expect(noteOnNotes).toEqual([
      60, 60, 67, 67, 69, 69, 67,
      65, 65, 64, 64, 62, 62, 60,
    ]);
    expect(noteOffNotes).toEqual([
      60, 60, 67, 67, 69, 69, 67,
      65, 65, 64, 64, 62, 62, 60,
    ]);
    expect(metaKinds).toContain("set-tempo");
    expect(metaKinds).toContain("end-of-track");
  });
});
