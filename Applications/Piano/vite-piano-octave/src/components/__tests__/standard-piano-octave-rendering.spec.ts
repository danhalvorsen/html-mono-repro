// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { STANDARD_PIANO_OCTAVE_GEOMETRY } from "../../octave/geometry/StandardPianoOctaveGeometry";
import { DefaultPianoRootConfiguration } from "../PianoRootConfiguration";
import { PianoOctave } from "../piano-octave";
import type { TangentNewWc } from "../tangent-wc";
import "../piano-octave";
import "../tangent-wc";

describe("standard piano octave rendering", () => {
  it("uses the provided working standard piano geometry", () => {
    expect(STANDARD_PIANO_OCTAVE_GEOMETRY.whiteKeys[0]).toEqual({
      name: "C",
      points: [[0,0],[9.2,0],[9.2,90],[14.3,90],[14.3,150],[0,150]],
    });

    expect(STANDARD_PIANO_OCTAVE_GEOMETRY.blackKeys[0]).toEqual({
      name: "Cs",
      points: [[9.2,0],[19.4,0],[19.4,90],[9.2,90]],
    });
  });

  it("builds octave viewBox from the standard geometry", () => {
    const octave = DefaultPianoRootConfiguration.octaves[0];

    expect(octave.viewBox).toEqual({
      minX: 0,
      minY: 0,
      width: 100,
      height: 150,
    });
  });

  it("renders C as a closed path using the active root configuration points", async () => {
    const element = document.createElement("tangent-wc") as TangentNewWc;
    const octave = DefaultPianoRootConfiguration.octaves[0];

    element.options = octave.tangent.C;
    element.viewBox = octave.viewBox;

    document.body.appendChild(element);
    await element.updateComplete;

    const svg = element.shadowRoot?.querySelector("svg");
    const path = element.shadowRoot?.querySelector("path");

    expect(svg?.getAttribute("viewBox")).toBe("0 0 100 150");
    expect(path?.getAttribute("data-note")).toBe("C");
    const expectedPath = octave.tangent.C.geometry.points
      .map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`)
      .join(" ")
      .concat(" Z");

    expect(path?.getAttribute("d")).toBe(expectedPath);

    element.remove();
  });

  it("renders Cs as a closed path using the exact standard points", async () => {
    const element = document.createElement("tangent-wc") as TangentNewWc;
    const octave = DefaultPianoRootConfiguration.octaves[0];

    element.options = octave.tangent.Cs;
    element.viewBox = octave.viewBox;

    document.body.appendChild(element);
    await element.updateComplete;

    const path = element.shadowRoot?.querySelector("path");

    expect(path?.getAttribute("data-note")).toBe("Cs");
    expect(path?.getAttribute("d")).toBe(
      "M 9.2 0 L 19.4 0 L 19.4 90 L 9.2 90 Z"
    );

    element.remove();
  });

  it("piano-octave creates one tangent-wc for each tangent", async () => {
    const element = document.createElement("piano-octave") as PianoOctave;
    element.options = DefaultPianoRootConfiguration.octaves[0];

    document.body.appendChild(element);
    await element.updateComplete;

    const tangents = element.shadowRoot?.querySelectorAll("tangent-wc");

    expect(tangents?.length).toBe(12);

    element.remove();
  });
});
