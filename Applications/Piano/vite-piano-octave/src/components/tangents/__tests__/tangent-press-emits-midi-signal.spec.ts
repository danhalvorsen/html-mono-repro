// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import type { PianoOctave } from "../../octave/piano-octave";
import { PianoEventName, type TangentHoldStartDetail } from "../../../application/contracts/PianoEventContracts";
import { DefaultPianoRootConfiguration } from "../../piano/PianoRootConfiguration";
import "../../octave/piano-octave";
import "../tangent-wc";

describe("tangent press midi signal contract", () => {
  it("emits tangent-hold-start with midi note payload when a tangent is pressed", async () => {
    const octave = document.createElement("piano-octave") as PianoOctave;
    octave.options = DefaultPianoRootConfiguration.octaves[0];
    document.body.appendChild(octave);
    await octave.updateComplete;

    let holdStartDetail: TangentHoldStartDetail | null = null;
    octave.addEventListener(PianoEventName.TangentHoldStart, (event) => {
      holdStartDetail = (event as CustomEvent<TangentHoldStartDetail>).detail;
    });

    const tangent = octave.shadowRoot?.querySelector("tangent-wc");
    expect(tangent).toBeTruthy();
    await (tangent as HTMLElement & { updateComplete?: Promise<unknown> }).updateComplete;

    const path = tangent?.shadowRoot?.querySelector("path");
    expect(path).toBeTruthy();

    path?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    await octave.updateComplete;

    expect(holdStartDetail).toBeTruthy();
    expect(holdStartDetail?.note).toBeTruthy();
    expect(typeof holdStartDetail?.midiNote).toBe("number");
    expect(holdStartDetail?.midiNote).not.toBeNaN();

    octave.remove();
  });
});
