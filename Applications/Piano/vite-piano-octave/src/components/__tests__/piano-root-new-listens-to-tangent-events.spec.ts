// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { DefaultPianoRootConfiguration } from "../PianoRootConfiguration";
import {
  PianoRootEventName,
  type PianoRootTangentEventDetail,
} from "../PianoRootEventContracts";
import type { PianoRoot } from "../piano-root-new";
import type { TangentNewWc } from "../tangent-wc";
import "../piano-root-new";
import "../tangent-wc";

async function renderPianoWithTangent(noteName: "C" | "Cs"): Promise<{
  readonly piano: PianoRoot;
  readonly tangent: TangentNewWc;
  readonly path: SVGPathElement;
}> {
  const options = DefaultPianoRootConfiguration;
  const octave = options.octaves[0];

  const piano = document.createElement("piano-root-new") as PianoRoot;
  piano.options = options;

  const tangent = document.createElement("tangent-wc") as TangentNewWc;
  tangent.options = octave.tangent[noteName];
  tangent.viewBox = octave.viewBox;

  piano.appendChild(tangent);
  document.body.appendChild(piano);

  await piano.updateComplete;
  await tangent.updateComplete;

  const path = tangent.shadowRoot?.querySelector("path");

  expect(path).toBeTruthy();

  return {
    piano,
    tangent,
    path: path as SVGPathElement,
  };
}

describe("piano-root-new tangent event listening", () => {
  it("listens to Tangent OnPressed and dispatches Piano OnPressed", async () => {
    const { piano, tangent, path } = await renderPianoWithTangent("C");

    let received: PianoRootTangentEventDetail | null = null;

    piano.addEventListener(PianoRootEventName.TangentPressed, (event) => {
      received = (event as CustomEvent<PianoRootTangentEventDetail>).detail;
    });

    path.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        composed: true,
      }),
    );

    await tangent.updateComplete;
    await piano.updateComplete;

    expect(received).not.toBeNull();
    expect(received?.kind).toBe("pressed");
    expect(received?.pointerId).toBe(1);
    expect(received?.tangent.id).toBe("C1");
    expect(received?.tangent.note).toBe("C");
    expect(received?.tangent.keyType).toBe("white");
    expect(received?.tangent.midiNote).toBe(DefaultPianoRootConfiguration.octaves[0].tangent.C.midiNote);
    expect(received?.tangent.points.length).toBeGreaterThan(0);

    piano.remove();
  });

  it("listens to Tangent OnReleased and dispatches Piano OnReleased", async () => {
    const { piano, tangent, path } = await renderPianoWithTangent("Cs");

    let received: PianoRootTangentEventDetail | null = null;

    piano.addEventListener(PianoRootEventName.TangentReleased, (event) => {
      received = (event as CustomEvent<PianoRootTangentEventDetail>).detail;
    });

    path.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        composed: true,
      }),
    );

    await tangent.updateComplete;
    await piano.updateComplete;

    path.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        composed: true,
      }),
    );

    await tangent.updateComplete;
    await piano.updateComplete;

    expect(received).not.toBeNull();
    expect(received?.kind).toBe("released");
    expect(received?.pointerId).toBe(1);
    expect(received?.tangent.id).toBe("Cs1");
    expect(received?.tangent.note).toBe("Cs");
    expect(received?.tangent.keyType).toBe("black");
    expect(received?.tangent.midiNote).toBe(DefaultPianoRootConfiguration.octaves[0].tangent.Cs.midiNote);
    expect(received?.tangent.points.length).toBeGreaterThan(0);

    piano.remove();
  });
});
