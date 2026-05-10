// FILE: src/components/__tests__/tangent-wc-click-event.spec.ts
// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import type {
  TangentNewClickEventDetail,
  TangentWC,
} from "../tangent-wc";
import "../tangent-wc";

describe("tangent-wc click event", () => {
  it("dispatches tangent-new-click when the rendered tangent path is clicked", async () => {
    const element = document.createElement("tangent-wc") as TangentWC;

    element.options = {
      note: "C",
      tangentId: "C1",
      midiNote: 60,
      isBlack: false,
      polygon: {
        points: [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
        ],
        fill: "#ffffff",
        pressedFill: "#cccccc",
      },
    };

    document.body.appendChild(element);
    await element.updateComplete;

    const path = element.shadowRoot?.querySelector("path");
    expect(path).toBeTruthy();

    let clickDetail: TangentNewClickEventDetail | null = null;

    element.addEventListener("tangent-new-click", (event) => {
      clickDetail = (event as CustomEvent<TangentNewClickEventDetail>).detail;
    });

    path?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        composed: true,
      }),
    );

    expect(clickDetail).not.toBeNull();
    expect((clickDetail as TangentNewClickEventDetail).tangent.id).toBe("C1");
    expect(clickDetail?.tangent.note).toBe("C");
    expect(clickDetail?.tangent.keyType).toBe("white");
    expect(clickDetail?.tangent.midiNote).toBe(60);
    expect(clickDetail?.tangent.points).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ]);

    element.remove();
  });
});