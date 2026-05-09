// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { TangentInputEventName } from "../PianoRootEventContracts";
import type {
  TangentNewPointerEventDetail,
  TangentNewWc,
} from "../tangent-wc";
import "../tangent-wc";

function createTangent(): TangentNewWc {
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

  return tangent;
}

describe("tangent-wc press lock state", () => {
  it("toggles to released on the second click", async () => {
    const tangent = createTangent();

    document.body.appendChild(tangent);
    await tangent.updateComplete;

    let pressedCount = 0;

    tangent.addEventListener(TangentInputEventName.Pressed, (event) => {
      const detail = (event as CustomEvent<TangentNewPointerEventDetail>).detail;

      expect(detail.tangent.id).toBe("C1");
      expect(detail.tangent.note).toBe("C");
      expect(detail.tangent.midiNote).toBe(24);

      pressedCount += 1;
    });

    tangent.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        composed: true,
      }),
    );

    await tangent.updateComplete;

    tangent.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        composed: true,
      }),
    );

    await tangent.updateComplete;

    expect(pressedCount).toBe(1);
    expect(tangent.isPlaying).toBe(false);
    expect(tangent.isReadyToPress).toBe(true);

    tangent.remove();
  });

  it("allows a new OnPressed only after OnReleased", async () => {
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

    tangent.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        composed: true,
      }),
    );

    await tangent.updateComplete;

    tangent.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        composed: true,
      }),
    );

    await tangent.updateComplete;

    expect(pressedCount).toBe(2);
    expect(releasedCount).toBe(1);
    expect(tangent.isPlaying).toBe(true);
    expect(tangent.isReadyToPress).toBe(false);

    tangent.remove();
  });
});
