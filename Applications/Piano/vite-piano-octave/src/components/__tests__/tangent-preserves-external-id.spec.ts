// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { Tangent } from "../tangent";
import { TangentSkin } from "../tangent-skin";
import { DEFAULT_OCTAVE_GEOMETRY } from "../../octave/geometry/DefaultOctaveGeometry";

describe("Tangent external id contract", () => {
  it("keeps base note and octave-qualified tangent id as separate values", async () => {
    const geometry = DEFAULT_OCTAVE_GEOMETRY.whiteKeys.find((key) => key.name === "C");

    expect(geometry).toBeDefined();

    const tangent = document.createElement("piano-tangent") as Tangent;

    tangent.note = "C";
    tangent.tangentId = "C2";
    tangent.geometry = geometry!;

    document.body.appendChild(tangent);
    await tangent.updateComplete;

    expect(tangent.note).toBe("C");
    expect(tangent.tangentId).toBe("C2");

    tangent.remove();
  });

  it("does not overwrite a parent-assigned tangent id when geometry is assigned", async () => {
    const geometry = DEFAULT_OCTAVE_GEOMETRY.blackKeys.find((key) => key.name === "Fs");

    expect(geometry).toBeDefined();

    const tangent = document.createElement("piano-tangent") as Tangent;

    tangent.tangentId = "Fs4";
    tangent.geometry = geometry!;

    document.body.appendChild(tangent);
    await tangent.updateComplete;

    expect(tangent.note).toBe("Fs");
    expect(tangent.tangentId).toBe("Fs4");
    expect(tangent.isBlack).toBe(true);

    tangent.remove();
  });

  it("passes the same octave-qualified tangent id into tangent-skin", async () => {
    const geometry = DEFAULT_OCTAVE_GEOMETRY.blackKeys.find((key) => key.name === "As");

    expect(geometry).toBeDefined();

    const tangent = document.createElement("piano-tangent") as Tangent;

    tangent.tangentId = "As3";
    tangent.geometry = geometry!;

    document.body.appendChild(tangent);
    await tangent.updateComplete;

    const skin = tangent.shadowRoot?.querySelector("tangent-skin") as TangentSkin | null;

    expect(skin).toBeInstanceOf(TangentSkin);
    expect(skin?.tangentId).toBe("As3");

    await skin!.updateComplete;

    const label = skin!.shadowRoot?.querySelector(".label");

    expect(label).toBeInstanceOf(HTMLElement);
    expect(label?.textContent).toBe("As3");

    tangent.remove();
  });
});