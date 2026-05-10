// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { DefaultPianoRootConfiguration } from "../../piano/PianoRootConfiguration";
import { DEFAULT_OCTAVE_GEOMETRY } from "../../../octave/geometry/DefaultOctaveGeometry";
import type { PianoOctave } from "../piano-octave";
import "../piano-octave";
import "../../tangents/tangent-wc";

describe("piano octave default geometry rendering", () => {
  it("renders C path from DefaultOctaveGeometry", async () => {
    const element = document.createElement("piano-octave") as PianoOctave;
    element.options = DefaultPianoRootConfiguration.octaves[0];

    document.body.appendChild(element);
    await element.updateComplete;

    const cTangent = element.shadowRoot
      ?.querySelectorAll("tangent-wc")
      .item(0) as HTMLElement | undefined;

    expect(cTangent).toBeDefined();

    const path = cTangent?.shadowRoot?.querySelector("path");
    const cPoints = DEFAULT_OCTAVE_GEOMETRY.whiteKeys.find((key) => key.name === "C")?.points ?? [];
    const expectedPath = cPoints
      .map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`)
      .join(" ")
      .concat(" Z");

    expect(path?.getAttribute("data-note")).toBe("C");
    expect(path?.getAttribute("d")).toBe(expectedPath);

    element.remove();
  });
});
