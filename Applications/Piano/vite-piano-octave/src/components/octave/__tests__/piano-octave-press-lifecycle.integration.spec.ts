// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import type { PianoOctave } from "../piano-octave";
import { PianoEventName } from "../../../application/contracts/PianoEventContracts";
import { DefaultPianoRootConfiguration } from "../../piano/PianoRootConfiguration";
import "../piano-octave";
import "../../tangents/tangent-wc";

describe("piano-octave press lifecycle integration", () => {
  it("emits hold start/end and toggles pressed visual on pointer down/up", async () => {
    const octave = document.createElement("piano-octave") as PianoOctave;
    octave.options = DefaultPianoRootConfiguration.octaves[0];
    document.body.appendChild(octave);
    await octave.updateComplete;

    const tangent = octave.shadowRoot?.querySelector("tangent-wc") as
      | (HTMLElement & { updateComplete?: Promise<unknown>; isPlaying?: boolean; shadowRoot: ShadowRoot })
      | null;
    expect(tangent).toBeTruthy();
    await tangent?.updateComplete;

    const path = tangent?.shadowRoot.querySelector("path");
    expect(path).toBeTruthy();

    let starts = 0;
    let ends = 0;
    octave.addEventListener(PianoEventName.TangentHoldStart, () => {
      starts += 1;
    });
    octave.addEventListener(PianoEventName.TangentHoldEnd, () => {
      ends += 1;
    });

    const fillBefore = path?.getAttribute("fill");
    expect(fillBefore).toBeTruthy();
    expect(tangent?.isPlaying).toBe(false);

    path?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    await tangent?.updateComplete;

    const fillPressed = tangent?.shadowRoot.querySelector("path")?.getAttribute("fill");
    expect(starts).toBe(1);
    expect(tangent?.isPlaying).toBe(true);
    expect(fillPressed).not.toBe(fillBefore);

    path?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    await tangent?.updateComplete;

    const fillAfter = tangent?.shadowRoot.querySelector("path")?.getAttribute("fill");
    expect(ends).toBe(1);
    expect(tangent?.isPlaying).toBe(false);
    expect(fillAfter).toBe(fillBefore);

    octave.remove();
  });
});
