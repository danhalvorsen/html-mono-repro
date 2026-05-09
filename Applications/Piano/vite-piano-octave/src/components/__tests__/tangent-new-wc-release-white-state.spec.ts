// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import type { TangentNewWc } from "../tangent-wc";
import "../tangent-wc";

describe("tangent-wc release color state", () => {
  it("renders white again when released after being pressed", async () => {
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

    const initialPath = tangent.shadowRoot?.querySelector("path");
    expect(initialPath).toBeTruthy();
    expect(initialPath?.getAttribute("fill")).toBe("#ffffff");
    expect(tangent.isPlaying).toBe(false);

    initialPath?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        composed: true,
      }),
    );

    await tangent.updateComplete;

    expect(tangent.isPlaying).toBe(true);

    const pressedPath = tangent.shadowRoot?.querySelector("path");
    expect(pressedPath).toBeTruthy();

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
