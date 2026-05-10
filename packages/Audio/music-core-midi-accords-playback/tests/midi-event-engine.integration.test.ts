import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { MidiEventEngine, MidiLogicalEventKind, type MidiLogicalEvent } from "../src/midi-event-engine.js";
import { buildEventReport, MidiBinarySongFromNotation, SongText } from "./support/song-fixtures.js";

describe("MidiEventEngine integration", () => {
  it("plays the provided melody song and returns note timeline", () => {
    const engine = new MidiEventEngine();
    const song = new MidiBinarySongFromNotation(new SongText());

    const events = engine.play(song);
    writeReport(events);

    const noteOns = events.filter((event) => event.kind === MidiLogicalEventKind.NoteOn);
    const noteOffs = events.filter((event) => event.kind === MidiLogicalEventKind.NoteOff);

    expect(noteOns).toHaveLength(14);
    expect(noteOffs).toHaveLength(14);

    const noteOnNumbers = noteOns.map((event) => event.noteNumber);
    expect(noteOnNumbers).toEqual([
      60, 60, 67, 67, 69, 69, 67,
      65, 65, 64, 64, 62, 62, 60,
    ]);

    const durations = noteOns.map((event) => Math.round(event.durationMs));
    expect(durations).toEqual([
      500, 500, 500, 500, 500, 500, 1000,
      500, 500, 500, 500, 500, 500, 1000,
    ]);

  });
});

function writeReport(events: readonly MidiLogicalEvent[]): void {
  const reportPath = resolve("test-results/midi-event-report.txt");
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, buildEventReport(events), "utf8");
}
