// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { DefaultPianoRootConfiguration } from "../../piano/PianoRootConfiguration";
import {
  TangentInputEventName,
} from "../../piano/PianoRootEventContracts";
import type {
  TangentNewPointerEventDetail,
  TangentWC,
} from "../tangent-wc";
import "../tangent-wc";

async function renderTangent(noteName: "C" | "Cs"): Promise<TangentWC> {
  const octave = DefaultPianoRootConfiguration.octaves[0];
  const element = document.createElement("tangent-wc") as TangentWC;

  element.options = octave.tangent[noteName];
  element.viewBox = octave.viewBox;

  document.body.appendChild(element);
  await element.updateComplete;

  return element;
}

describe("tangent-wc pressed/released event payload", () => {
  it("dispatches OnPressed with key identity and midi information for a white key", async () => {
    const element = await renderTangent("C");
    const path = element.shadowRoot?.querySelector("path");

    expect(path).toBeTruthy();

    let detail: TangentNewPointerEventDetail | null = null;

    element.addEventListener(TangentInputEventName.Pressed, (event) => {
      detail = (event as CustomEvent<TangentNewPointerEventDetail>).detail;
    });

    path?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        composed: true,
      }),
    );

    await element.updateComplete;

    expect(detail).not.toBeNull();
    expect(detail?.pointerId).toBe(1);
    expect(detail?.tangent.id).toBe("C1");
    expect(detail?.tangent.note).toBe("C");
    expect(detail?.tangent.keyType).toBe("white");
    expect(detail?.tangent.midiNote).toBe(DefaultPianoRootConfiguration.octaves[0].tangent.C.midiNote);
    expect(detail?.tangent.points.length).toBeGreaterThan(0);
    expect(element.isPlaying).toBe(true);

    element.remove();
  });

  it("dispatches OnPressed with key identity and midi information for a black key", async () => {
    const element = await renderTangent("Cs");
    const path = element.shadowRoot?.querySelector("path");

    expect(path).toBeTruthy();

    let detail: TangentNewPointerEventDetail | null = null;

    element.addEventListener(TangentInputEventName.Pressed, (event) => {
      detail = (event as CustomEvent<TangentNewPointerEventDetail>).detail;
    });

    path?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        composed: true,
      }),
    );

    await element.updateComplete;

    expect(detail).not.toBeNull();
    expect(detail?.tangent.id).toBe("Cs1");
    expect(detail?.tangent.note).toBe("Cs");
    expect(detail?.tangent.keyType).toBe("black");
    expect(detail?.tangent.midiNote).toBe(DefaultPianoRootConfiguration.octaves[0].tangent.Cs.midiNote);
    expect(detail?.tangent.points.length).toBeGreaterThan(0);
    expect(element.isPlaying).toBe(true);

    element.remove();
  });

  it("dispatches OnReleased with the same key identity and midi information", async () => {
    const element = await renderTangent("C");
    const path = element.shadowRoot?.querySelector("path");

    expect(path).toBeTruthy();

    let releasedDetail: TangentNewPointerEventDetail | null = null;

    element.addEventListener(TangentInputEventName.Released, (event) => {
      releasedDetail = (event as CustomEvent<TangentNewPointerEventDetail>).detail;
    });

    path?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        composed: true,
      }),
    );

    await element.updateComplete;

    path?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        composed: true,
      }),
    );

    await element.updateComplete;

    expect(releasedDetail).not.toBeNull();
    expect(releasedDetail?.pointerId).toBe(1);
    expect(releasedDetail?.tangent.id).toBe("C1");
    expect(releasedDetail?.tangent.note).toBe("C");
    expect(releasedDetail?.tangent.keyType).toBe("white");
    expect(releasedDetail?.tangent.midiNote).toBe(DefaultPianoRootConfiguration.octaves[0].tangent.C.midiNote);
    expect(releasedDetail?.tangent.points.length).toBeGreaterThan(0);
    expect(element.isPlaying).toBe(false);

    element.remove();
  });
});
