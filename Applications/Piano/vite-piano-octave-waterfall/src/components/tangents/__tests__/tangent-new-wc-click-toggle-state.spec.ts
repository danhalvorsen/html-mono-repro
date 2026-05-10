// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { TangentInputEventName } from "../../piano/PianoRootEventContracts";
import type { TangentWC } from "../tangent-wc";
import "../tangent-wc";

function createTangent(): TangentWC {
  const tangent = document.createElement("tangent-wc") as TangentWC;

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

  return tangent;
}

describe("tangent-wc click toggle state", () => {
  it("first click plays and next click stops", async () => {
    const tangent = createTangent();

    document.body.appendChild(tangent);
    await tangent.updateComplete;

    let pressedCount = 0;
    let releasedCount = 0;

    tangent.addEventListener(TangentInputEventName.Pressed, () => {
      pressedCount += 1;
    });

    tangent.addEventListener(TangentInputEventName.Released, () => {
      releasedCount += 1;
    });

    tangent.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        composed: true,
      }),
    );

    await tangent.updateComplete;

    expect(pressedCount).toBe(1);
    expect(releasedCount).toBe(0);
    expect(tangent.isPlaying).toBe(true);
    expect(tangent.shadowRoot?.querySelector("path")?.getAttribute("fill")).toBe("#00ff00");

    tangent.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        composed: true,
      }),
    );

    await tangent.updateComplete;

    expect(pressedCount).toBe(1);
    expect(releasedCount).toBe(1);
    expect(tangent.isPlaying).toBe(false);
    expect(tangent.shadowRoot?.querySelector("path")?.getAttribute("fill")).toBe("#ffffff");

    tangent.remove();
  });
});
