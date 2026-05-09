// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import {
  DefaultPianoRootConfiguration,
  PianoRootConfigurationFactory,
} from "../PianoRootConfiguration";
import { PianoOctave } from "../piano-octave";
import type { TangentNewWc } from "../tangent-wc";
import "../piano-octave";
import "../tangent-wc";

describe("PianoOctave creates TangentNewWc", () => {
  it("creates one tangent-wc for each configured tangent", async () => {
    const element = document.createElement("piano-octave") as PianoOctave;
    element.options = DefaultPianoRootConfiguration.octaves[0];

    document.body.appendChild(element);
    await element.updateComplete;

    const tangents = element.shadowRoot?.querySelectorAll("tangent-wc");

    expect(tangents?.length).toBe(element.options.tangents.length);
    expect(tangents?.length).toBe(12);

    element.remove();
  });

  it("passes each tangent configuration object to the created TangentNewWc", async () => {
    const element = document.createElement("piano-octave") as PianoOctave;
    element.options = DefaultPianoRootConfiguration.octaves[0];

    document.body.appendChild(element);
    await element.updateComplete;

    const tangents = Array.from(
      element.shadowRoot?.querySelectorAll("tangent-wc") ?? []
    ) as TangentNewWc[];

    expect(tangents.map((tangent) => tangent.options.note)).toEqual(
      element.options.tangents.map((tangent) => tangent.note)
    );

    expect(tangents[0]?.options).toBe(element.options.tangents[0]);
    expect(tangents[1]?.options).toBe(element.options.tangents[1]);

    element.remove();
  });

  it("does not use slot fallback TangentNewWc placeholders", async () => {
    const element = document.createElement("piano-octave") as PianoOctave;
    element.options = DefaultPianoRootConfiguration.octaves[0];

    document.body.appendChild(element);
    await element.updateComplete;

    expect(element.shadowRoot?.querySelector("slot")).toBeNull();
    expect(element.children.length).toBe(0);
    expect(element.shadowRoot?.querySelector("tangent-wc")).not.toBeNull();

    element.remove();
  });

  it("supports another octave configuration without changing the component code", async () => {
    const configuration = new PianoRootConfigurationFactory().create({
      octaveCount: 2,
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
    });

    const secondOctave = configuration.octaves[1];

    const element = document.createElement("piano-octave") as PianoOctave;
    element.options = secondOctave;

    document.body.appendChild(element);
    await element.updateComplete;

    const tangents = Array.from(
      element.shadowRoot?.querySelectorAll("tangent-wc") ?? []
    ) as TangentNewWc[];

    expect(tangents[0]?.options.id).toBe("C2");
    expect(tangents[0]?.options.octaveIndex).toBe(1);

    element.remove();
  });
});