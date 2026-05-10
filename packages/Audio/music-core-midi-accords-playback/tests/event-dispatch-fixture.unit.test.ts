import { describe, expect, it } from "vitest";

import { MidiLogicalEventKind, type MidiLogicalEvent } from "../src/midi-event-engine.js";
import { EventDispatchFixture } from "./support/event-dispatch-fixture.js";

describe("EventDispatchFixture unit", () => {
  it("notifies any-event listeners for each dispatched event in order", () => {
    const fixture = new EventDispatchFixture();
    const seen: string[] = [];
    fixture.onAny((event) => seen.push(event.kind));

    const events = [createMeta(0), createNoteOn(1, 60), createNoteOff(2, 60)] as const;
    fixture.dispatch(events);

    expect(seen).toEqual([
      MidiLogicalEventKind.Meta,
      MidiLogicalEventKind.NoteOn,
      MidiLogicalEventKind.NoteOff,
    ]);
  });

  it("notifies only listeners registered for the matching kind", () => {
    const fixture = new EventDispatchFixture();
    const noteOnNotes: number[] = [];
    const noteOffNotes: number[] = [];

    fixture.onKind(MidiLogicalEventKind.NoteOn, (event) => {
      if (event.kind === MidiLogicalEventKind.NoteOn) {
        noteOnNotes.push(event.noteNumber);
      }
    });
    fixture.onKind(MidiLogicalEventKind.NoteOff, (event) => {
      if (event.kind === MidiLogicalEventKind.NoteOff) {
        noteOffNotes.push(event.noteNumber);
      }
    });

    fixture.dispatch([createMeta(0), createNoteOn(1, 64), createNoteOff(2, 64)]);

    expect(noteOnNotes).toEqual([64]);
    expect(noteOffNotes).toEqual([64]);
  });

  it("calls any-event listeners before kind listeners for each event", () => {
    const fixture = new EventDispatchFixture();
    const callOrder: string[] = [];

    fixture.onAny(() => callOrder.push("any"));
    fixture.onKind(MidiLogicalEventKind.NoteOn, () => callOrder.push("kind"));

    fixture.dispatch([createNoteOn(0, 67)]);
    expect(callOrder).toEqual(["any", "kind"]);
  });
});

function createMeta(sequence: number): MidiLogicalEvent {
  return {
    kind: MidiLogicalEventKind.Meta,
    absoluteTick: 0,
    timestampMs: 0,
    trackIndex: 0,
    sequence,
    rawBytes: [],
    metaType: 0x03,
    metaKind: "track-name",
    data: [],
    text: "fixture",
  };
}

function createNoteOn(sequence: number, noteNumber: number): MidiLogicalEvent {
  return {
    kind: MidiLogicalEventKind.NoteOn,
    absoluteTick: sequence * 10,
    timestampMs: sequence * 10,
    trackIndex: 0,
    sequence,
    rawBytes: [],
    status: 0x90,
    channel: 0,
    noteNumber,
    velocity: 100,
    durationMs: 50,
  };
}

function createNoteOff(sequence: number, noteNumber: number): MidiLogicalEvent {
  return {
    kind: MidiLogicalEventKind.NoteOff,
    absoluteTick: sequence * 10,
    timestampMs: sequence * 10,
    trackIndex: 0,
    sequence,
    rawBytes: [],
    status: 0x80,
    channel: 0,
    noteNumber,
    velocity: 0,
  };
}
