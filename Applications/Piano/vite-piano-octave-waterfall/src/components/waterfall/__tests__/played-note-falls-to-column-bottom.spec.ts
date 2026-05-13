// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { DefaultPianoRootConfiguration } from "../../piano/PianoRootConfiguration";
import "../piano-waterfall-column";
import type { ColumnWc } from "../piano-waterfall-column";
import "../piano-waterfall-new";
import type { PianoWaterfallNew } from "../piano-waterfall-new";

describe("played-note waterfall movement", () => {
  it("moves a played-note-wc to the bottom of its column", async () => {
    const waterfall = document.createElement("piano-waterfall-new") as PianoWaterfallNew;
    const column = document.createElement("column-wc") as ColumnWc;

    const baseColumn = DefaultPianoRootConfiguration.waterfall.columns[0];

    if (baseColumn === undefined) {
      throw new Error("Missing default waterfall column configuration.");
    }

    column.slot = "column-0";
    column.options = {
      ...baseColumn,
      size: { x: 32, y: 180 },
      playedNote: {
        ...baseColumn.playedNote,
        size: { x: 32, y: 20 },
        speedPxPerSecond: 200,
      },
    };

    waterfall.options = {
      ...DefaultPianoRootConfiguration.waterfall,
      columns: [column.options],
      size: { x: 32, y: 180 },
    };

    waterfall.appendChild(column);
    document.body.appendChild(waterfall);

    await waterfall.updateComplete;
    await column.updateComplete;

    const now = performance.now();
    waterfall.handleParsedNoteEvent({
      type: "noteon",
      timestamp: now,
      channel: 1,
      midiNote: 60,
      velocity: 100,
      columnIndex: 0,
      pitchClass: 0,
    });

    waterfall.handleParsedNoteEvent({
      type: "noteoff",
      timestamp: now + 300,
      channel: 1,
      midiNote: 60,
      velocity: 0,
      columnIndex: 0,
      pitchClass: 0,
    });

    const notes = column.querySelectorAll("played-note-wc");
    expect(notes.length).toBeGreaterThan(0);

    const activeNote = notes[notes.length - 1] as HTMLElement & {
      updateComplete?: Promise<unknown>;
      options?: { size?: { y?: number } };
    };

    await activeNote.updateComplete;
    for (let index = 0; index < 4; index += 1) {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    }

    const currentTop = Number.parseFloat(activeNote.style.top || "0");
    expect(currentTop).toBeGreaterThan(0);

    waterfall.remove();
  });

  it("adds a new falling note for each trigger", async () => {
    const waterfall = document.createElement("piano-waterfall-new") as PianoWaterfallNew;
    const column = document.createElement("column-wc") as ColumnWc;
    const baseColumn = DefaultPianoRootConfiguration.waterfall.columns[0];

    if (baseColumn === undefined) {
      throw new Error("Missing default waterfall column configuration.");
    }

    column.slot = "column-0";
    column.options = {
      ...baseColumn,
      size: { x: 32, y: 180 },
    };

    waterfall.options = {
      ...DefaultPianoRootConfiguration.waterfall,
      columns: [column.options],
      size: { x: 32, y: 180 },
    };

    waterfall.appendChild(column);
    document.body.appendChild(waterfall);

    await waterfall.updateComplete;
    await column.updateComplete;

    const triggerNote = (midiNote: number, holdMs: number): void => {
      const now = performance.now();
      waterfall.handleParsedNoteEvent({
        type: "noteon",
        timestamp: now,
        channel: 1,
        midiNote,
        velocity: 100,
        columnIndex: 0,
        pitchClass: midiNote % 12,
      });

      waterfall.handleParsedNoteEvent({
        type: "noteoff",
        timestamp: now + holdMs,
        channel: 1,
        midiNote,
        velocity: 0,
        columnIndex: 0,
        pitchClass: midiNote % 12,
      });
    };

    triggerNote(60, 160);
    triggerNote(64, 260);
    triggerNote(67, 320);

    const notes = Array.from(column.querySelectorAll("played-note-wc"));
    expect(notes.length).toBe(3);

    waterfall.remove();
  });
});
