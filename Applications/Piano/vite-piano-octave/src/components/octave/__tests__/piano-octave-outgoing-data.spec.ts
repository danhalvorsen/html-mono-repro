// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { DefaultPianoRootConfiguration } from "../../piano/PianoRootConfiguration";
import type { PianoOctave } from "../piano-octave";
import type { TangentWC } from "../../tangents/tangent-wc";
import "../piano-octave";
import "../../tangents/tangent-wc";

describe("piano-octave outgoing data", () => {
  it("passes correct options and viewBox to every tangent-wc", async () => {
    const element = document.createElement("piano-octave") as PianoOctave;
    const octaveOptions = DefaultPianoRootConfiguration.octaves[0];
    const expectedTangents = [...octaveOptions.tangents].sort(
      (left, right) => left.layout.zIndex - right.layout.zIndex
    );

    element.options = octaveOptions;
    document.body.appendChild(element);
    await element.updateComplete;

    const tangents = Array.from(
      element.shadowRoot?.querySelectorAll("tangent-wc") ?? []
    ) as TangentWC[];

    expect(tangents.length).toBe(expectedTangents.length);

    tangents.forEach((tangentElement, index) => {
      const expected = expectedTangents[index];

      expect(tangentElement.options).toBe(expected);
      expect(tangentElement.viewBox).toBe(octaveOptions.viewBox);

      const path = tangentElement.shadowRoot?.querySelector("path");
      expect(path?.getAttribute("data-note")).toBe(expected.note);
    });

    element.remove();
  });
});
