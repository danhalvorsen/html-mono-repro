// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import type { PianoApp } from "../../../piano-app";
import "../../../piano-app";

describe("waterfall played-note rendering on tangent press", () => {
  it("has played-note-wc rendered in waterfall when a tangent is pressed", async () => {
    const app = document.createElement("piano-app") as PianoApp;
    document.body.appendChild(app);
    await app.updateComplete;

    const appShadow = app.shadowRoot;
    expect(appShadow).toBeTruthy();

    const octave = appShadow?.querySelector("piano-octave");
    expect(octave).toBeTruthy();
    await (octave as HTMLElement & { updateComplete?: Promise<unknown> }).updateComplete;

    const tangent = octave?.shadowRoot?.querySelector("tangent-wc");
    expect(tangent).toBeTruthy();
    await (tangent as HTMLElement & { updateComplete?: Promise<unknown> }).updateComplete;

    const path = tangent?.shadowRoot?.querySelector("path");
    expect(path).toBeTruthy();

    let holdStartCount = 0;
    octave?.addEventListener("tangent-hold-start", () => {
      holdStartCount += 1;
    });

    path?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));

    expect(holdStartCount).toBeGreaterThan(0);

    const playedNotes = appShadow?.querySelectorAll("played-note-wc") ?? [];
    expect(playedNotes.length).toBeGreaterThan(0);

    const firstPlayedNote = playedNotes[0] as HTMLElement & {
      options?: { fill?: string };
    };
    expect(firstPlayedNote.options?.fill).toBeTruthy();

    app.remove();
  });
});
