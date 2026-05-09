// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import {
  DefaultPianoRootConfiguration,
  PianoRootConfigurationFactory,
} from "../PianoRootConfiguration";
import { PianoOctave } from "../piano-octave";
import "../piano-octave";
import "../tangent-wc";

describe("PianoOctave tangent-wc composition", () => {
  it("renders tangent-wc for each configured tangent", async () => {
    const options = new PianoRootConfigurationFactory().create({
      octaveCount: 1,
      rootPosition: { x: 0, y: 0 },
      octaveSize: { x: 1000, y: 200 },
      octaveStartPosition: { x: 0, y: 300 },
      octaveGap: 6,
      waterfallPosition: { x: 0, y: 0 },
      waterfallHeightRatioToOctaveHeight: 1.4,
      maxSimultaneousOctaves: 2,
      midiTempoBpm: 130,
      playbackSpeed: 1,
      midiSignalRate: 1,
    }).octaves[0];

    const element = document.createElement("piano-octave") as PianoOctave;
    element.options = options;

    document.body.appendChild(element);
    await element.updateComplete;

    const tangents = element.shadowRoot?.querySelectorAll("tangent-wc");

    expect(tangents?.length).toBe(12);

    element.remove();
  });

  it("passes each tangent option to tangent-wc", async () => {
    const options = DefaultPianoRootConfiguration.octaves[0];

    const element = document.createElement("piano-octave") as PianoOctave;
    element.options = options;

    document.body.appendChild(element);
    await element.updateComplete;

    const tangents = Array.from(
      element.shadowRoot?.querySelectorAll("tangent-wc") ?? []
    );

    const notes = tangents.map((item) => item.options.note);

    expect(notes).toEqual(["C", "D", "E", "F", "G", "A", "H", "Cs", "Ds", "Fs", "Gs", "As"]);

    element.remove();
  });

  it("does not require slotted tangent-wc children", async () => {
    const element = document.createElement("piano-octave") as PianoOctave;
    element.options = DefaultPianoRootConfiguration.octaves[0];

    document.body.appendChild(element);
    await element.updateComplete;

    expect(element.children.length).toBe(0);
    expect(element.shadowRoot?.querySelector("tangent-wc")).not.toBeNull();

    element.remove();
  });
});