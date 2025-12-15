import "../setup-jsdom.js";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { DomMouseController } from "../../src/services/DomMouseController.js";

describe("DomMouseController", () => {
    let controller: DomMouseController;
    let canvas: HTMLCanvasElement;

    beforeEach(() => {
        // fresh DOM for each test
        document.body.innerHTML = "";

        canvas = document.createElement("canvas");
        document.body.appendChild(canvas);

        controller = DomMouseController.instance;
        controller.disable();            // ensure no stale handlers
        controller.enable();             // clean state
    });

    afterEach(() => {
        controller.disable();            // clean global listeners
    });

    it("dispatches pointerdown", () => {
        const handler = vi.fn();
        controller.on("pointerdown", handler);

        const evt = new PointerEvent("pointerdown", {
            clientX: 100,
            clientY: 150,
            button: 0
        });

        document.dispatchEvent(evt);

        expect(handler).toHaveBeenCalledOnce();
        const arg = handler.mock.calls[0][0];

        expect(arg.x).toBe(100);
        expect(arg.y).toBe(150);

        controller.off("pointerdown", handler);
    });

    it("does not dispatch after disable()", () => {
        controller.disable();

        const handler = vi.fn();
        controller.on("pointerdown", handler);

        const evt = new PointerEvent("pointerdown", {
            clientX: 10,
            clientY: 20
        });

        document.dispatchEvent(evt);

        expect(handler).not.toHaveBeenCalled();
    });
});
