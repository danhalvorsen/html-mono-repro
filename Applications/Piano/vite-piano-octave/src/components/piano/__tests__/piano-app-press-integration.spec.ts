// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import type { PianoApp } from "../../../piano-app";
import { PianoEventName, type TangentHoldStartDetail } from "../../../application/contracts/PianoEventContracts";
import "../../../piano-app";

async function flushUpdates(...elements: Array<HTMLElement | null | undefined>): Promise<void> {
  for (const element of elements) {
    if (!element) {
      continue;
    }

    await (element as HTMLElement & { updateComplete?: Promise<unknown> }).updateComplete;
  }
}

describe("piano-app press integration", () => {
  it("pressing a rendered tangent changes fill to pressed color and back", async () => {
    const app = document.createElement("piano-app") as PianoApp;
    document.body.appendChild(app);
    await flushUpdates(app);

    const octave = app.shadowRoot?.querySelector("piano-octave") as HTMLElement | null;
    expect(octave).toBeTruthy();
    await flushUpdates(octave);

    const tangent = octave?.shadowRoot?.querySelector("tangent-wc") as HTMLElement | null;
    expect(tangent).toBeTruthy();
    await flushUpdates(tangent);

    const path = tangent?.shadowRoot?.querySelector("path");
    expect(path).toBeTruthy();

    const beforeFill = path?.getAttribute("fill");
    expect(beforeFill).toBeTruthy();

    path?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    await flushUpdates(tangent);

    const pressedFill = tangent?.shadowRoot?.querySelector("path")?.getAttribute("fill");
    expect(pressedFill).toBeTruthy();
    expect(pressedFill).not.toBe(beforeFill);

    path?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    await flushUpdates(tangent);

    const releasedFill = tangent?.shadowRoot?.querySelector("path")?.getAttribute("fill");
    expect(releasedFill).toBe(beforeFill);

    app.remove();
  });

  it("pressing a rendered tangent bubbles tangent-hold-start with midi payload to app boundary", async () => {
    const app = document.createElement("piano-app") as PianoApp;
    document.body.appendChild(app);
    await flushUpdates(app);

    const octave = app.shadowRoot?.querySelector("piano-octave") as HTMLElement | null;
    expect(octave).toBeTruthy();
    await flushUpdates(octave);

    const tangent = octave?.shadowRoot?.querySelector("tangent-wc") as HTMLElement | null;
    expect(tangent).toBeTruthy();
    await flushUpdates(tangent);

    const path = tangent?.shadowRoot?.querySelector("path");
    expect(path).toBeTruthy();

    let eventDetail: TangentHoldStartDetail | null = null;
    app.addEventListener(PianoEventName.TangentHoldStart, (event) => {
      eventDetail = (event as CustomEvent<TangentHoldStartDetail>).detail;
    });

    path?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    await flushUpdates(octave, tangent);

    expect(eventDetail).toBeTruthy();
    expect(typeof eventDetail?.midiNote).toBe("number");
    expect(eventDetail?.note).toBeTruthy();
    expect(eventDetail?.holdId).toBeTruthy();

    app.remove();
  });
});
