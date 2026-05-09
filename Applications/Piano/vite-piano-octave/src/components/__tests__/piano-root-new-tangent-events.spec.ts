// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import type { PianoRoot } from "../piano-root-new";
import {
  PianoRootEventName,
  TangentInputEventName,
  type PianoRootTangentEventDetail,
} from "../PianoRootEventContracts";
import "../piano-root-new";

function createTangentDetail() {
  return {
    pointerId: 7,
    tangent: {
      id: "C1",
      note: "C",
      keyType: "white" as const,
      points: [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
      ] as const,
      midiNote: 60,
    },
  };
}

describe("piano-root-new tangent events", () => {
  it("handles tangent pressed and dispatches piano tangent pressed", async () => {
    const root = document.createElement("piano-root-new") as PianoRoot;
    const tangentHost = document.createElement("div");

    root.appendChild(tangentHost);
    document.body.appendChild(root);
    await root.updateComplete;

    let received: PianoRootTangentEventDetail | null = null;

    root.addEventListener(PianoRootEventName.TangentPressed, (event) => {
      received = (event as CustomEvent<PianoRootTangentEventDetail>).detail;
    });

    tangentHost.dispatchEvent(
      new CustomEvent(TangentInputEventName.Pressed, {
        bubbles: true,
        composed: true,
        detail: createTangentDetail(),
      }),
    );

    expect(received).not.toBeNull();
    expect(received?.kind).toBe("pressed");
    expect(received?.pointerId).toBe(7);
    expect(received?.tangent.id).toBe("C1");
    expect(received?.tangent.note).toBe("C");
    expect(received?.tangent.midiNote).toBe(60);

    root.remove();
  });

  it("handles tangent released and dispatches piano tangent released", async () => {
    const root = document.createElement("piano-root-new") as PianoRoot;
    const tangentHost = document.createElement("div");

    root.appendChild(tangentHost);
    document.body.appendChild(root);
    await root.updateComplete;

    let received: PianoRootTangentEventDetail | null = null;

    root.addEventListener(PianoRootEventName.TangentReleased, (event) => {
      received = (event as CustomEvent<PianoRootTangentEventDetail>).detail;
    });

    tangentHost.dispatchEvent(
      new CustomEvent(TangentInputEventName.Released, {
        bubbles: true,
        composed: true,
        detail: createTangentDetail(),
      }),
    );

    expect(received).not.toBeNull();
    expect(received?.kind).toBe("released");
    expect(received?.pointerId).toBe(7);
    expect(received?.tangent.id).toBe("C1");
    expect(received?.tangent.note).toBe("C");
    expect(received?.tangent.midiNote).toBe(60);

    root.remove();
  });
});
