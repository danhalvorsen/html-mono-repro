import "../setup-jsdom.js";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { DragController } from "../../src/behaviors/DragController.js";
import { DomMouseController } from "../../src/services/DomMouseController.js";
import { DomGestureController, DomTouchController } from "../../../../../core-reactive-input/src/index.js";

describe("DomGestureController", () => {
  let controller: DomGestureController;
  let touch: DomTouchController;

  beforeEach(() => {
    touch = DomTouchController.instance;
    touch.enable();
    controller = new DomGestureController();
  });

  it("should recognize tap gesture", () => {
    const handler = vi.fn();
    controller.on("tap", handler);

    const start = new Touch({
      identifier: 1,
      target: document.body,
      clientX: 100,
      clientY: 100,
    });
    const end = new Touch({
      identifier: 1,
      target: document.body,
      clientX: 102,
      clientY: 101,
    });

    const touchStart = new TouchEvent("touchstart", { touches: [start] });
    const touchEnd = new TouchEvent("touchend", { changedTouches: [end] });

    document.dispatchEvent(touchStart);
    document.dispatchEvent(touchEnd);

    expect(handler).toHaveBeenCalled();
    const evt = handler.mock.calls[0][0];
    expect(evt.gesture).toBe("tap");
  });
});
