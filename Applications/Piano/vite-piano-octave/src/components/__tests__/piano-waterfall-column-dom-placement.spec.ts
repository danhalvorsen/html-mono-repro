// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { DefaultWaterfallColumnLayout } from "../../application/DefaultWaterfallColumnLayout";
import { PianoWaterfall } from "../piano-waterfall";
import { FallingNoteWc } from "../falling-note-wc";
import "../piano-waterfall-column";

describe("PianoWaterfall DOM placement contract", () => {
  it("renders static columns with left and width from DefaultWaterfallColumnLayout", async () => {
    const layout = new DefaultWaterfallColumnLayout();
    const waterfall = document.createElement("piano-waterfall") as PianoWaterfall;

    waterfall.octaves = 1;

    document.body.appendChild(waterfall);
    await waterfall.updateComplete;

    const columns = Array.from(
      waterfall.shadowRoot?.querySelectorAll("column-wc") ?? []
    ) as HTMLElement[];

    expect(columns).toHaveLength(layout.getColumnLayoutItems(1).length);

    const fsColumnIndex = 6;
    const expected = layout.getColumnLayoutItem(fsColumnIndex, 1);

    expect(expected).not.toBeNull();

    const fsColumn = columns[fsColumnIndex];

    expect(Number.parseFloat(fsColumn.style.left)).toBeCloseTo(expected!.leftPercent, 10);
    expect(Number.parseFloat(fsColumn.style.width)).toBeCloseTo(expected!.widthPercent, 10);

    waterfall.remove();
  });

  it("renders falling notes with the same left and width as the target column", async () => {
    const layout = new DefaultWaterfallColumnLayout();
    const waterfall = document.createElement("piano-waterfall") as PianoWaterfall;

    waterfall.octaves = 1;

    document.body.appendChild(waterfall);
    await waterfall.updateComplete;

    const fsColumnIndex = 6;
    const expected = layout.getColumnLayoutItem(fsColumnIndex, 1);

    expect(expected).not.toBeNull();

    waterfall.startHold("hold:Fs", fsColumnIndex);
    await waterfall.updateComplete;

    const fallingNote = waterfall.shadowRoot?.querySelector("falling-note-wc") as FallingNoteWc | null;

    expect(fallingNote).toBeInstanceOf(FallingNoteWc);
    expect(fallingNote?.leftPercent).toBeCloseTo(expected!.leftPercent, 10);
    expect(fallingNote?.widthPercent).toBeCloseTo(expected!.widthPercent, 10);

    waterfall.remove();
  });
});