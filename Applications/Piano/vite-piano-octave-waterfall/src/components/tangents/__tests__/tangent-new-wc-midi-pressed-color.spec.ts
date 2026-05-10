// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { TangentInputEventName } from "../../piano/PianoRootEventContracts";
import type {
  TangentNewPointerEventDetail,
  TangentWC,
} from "../tangent-wc";
import "../tangent-wc";

describe("tangent-wc midi + playing color", () => {
  it("renders green on press and emits midi information", async () => {
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
        fill: "#abcdef",
        pressedFill: "#123456",
      },
    };

    document.body.appendChild(element);
    await element.updateComplete;

    const path = element.shadowRoot?.querySelector("path");
    expect(path).toBeTruthy();
    expect(path?.getAttribute("fill")).toBe("#abcdef");

    let pointerDownDetail: TangentNewPointerEventDetail | null = null;

    element.addEventListener(TangentInputEventName.Pressed, (event) => {
      pointerDownDetail = (event as CustomEvent<TangentNewPointerEventDetail>).detail;
    });

    path?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        composed: true,
      }),
    );

    await element.updateComplete;

    const pressedPath = element.shadowRoot?.querySelector("path");

    expect(pressedPath?.getAttribute("fill")).toBe("#00ff00");
    expect(pointerDownDetail?.tangent.id).toBe("C1");
    expect(pointerDownDetail?.tangent.note).toBe("C");
    expect(pointerDownDetail?.tangent.keyType).toBe("white");
    expect(pointerDownDetail?.tangent.midiNote).toBe(60);
    expect(pointerDownDetail?.tangent.points).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ]);

    element.remove();
  });
});
