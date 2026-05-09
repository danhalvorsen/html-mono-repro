// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import type { TangentNewWc } from "../tangent-wc";
import "../tangent-wc";

describe("tangent-wc green press state", () => {
  it("renders green while pressed and white again when released", async () => {
    const tangent = document.createElement("tangent-wc") as TangentNewWc;

    tangent.options = {
      note: "C",
      tangentId: "C1",
      midiNote: 24,
      isBlack: false,
      polygon: {
        points: [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
        ],
        fill: "#ffffff",
      },
    };

    document.body.appendChild(tangent);
    await tangent.updateComplete;

    const path = tangent.shadowRoot?.querySelector("path");
    expect(path).toBeTruthy();

    expect(path?.getAttribute("fill")).toBe("#ffffff");
    expect(tangent.isPlaying).toBe(false);

    path?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        composed: true,
      }),
    );

    await tangent.updateComplete;

    const pressedPath = tangent.shadowRoot?.querySelector("path");
    expect(pressedPath?.getAttribute("fill")).toBe("#00ff00");
    expect(tangent.isPlaying).toBe(true);

    pressedPath?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        composed: true,
      }),
    );

    await tangent.updateComplete;

    const releasedPath = tangent.shadowRoot?.querySelector("path");
    expect(releasedPath?.getAttribute("fill")).toBe("#ffffff");
    expect(tangent.isPlaying).toBe(false);

    tangent.remove();
  });
});
