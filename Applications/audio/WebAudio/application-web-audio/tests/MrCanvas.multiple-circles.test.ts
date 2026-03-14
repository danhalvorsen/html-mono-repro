// Applications/audio/WebAudio/application-web-audio/tests/MrCanvas.multiple-circles.test.ts

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "../src/index.ts";
import { CircleShape } from "../src/lit3/WebComponents/Shapes/CircleShape.js";
import { MrCanvas } from "../src/lit3/WebComponents/MrCanvas.js";

class ResizeObserverStub {
  public observe(): void {
    // no-op
  }

  public disconnect(): void {
    // no-op
  }
}

type ShapeControllerAccessor = {
  shapeController: {
    getShapes(): readonly CircleShape[];
  };
};

const canvasContextStub = {
  clearRect: vi.fn(),
  setTransform: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  fillRect: vi.fn(),
  fillStyle: "",
  strokeStyle: "",
  lineWidth: 1,
} as unknown as CanvasRenderingContext2D;

describe("MrCanvas", () => {
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  const originalResizeObserver = globalThis.ResizeObserver;

  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      function (
        this: HTMLCanvasElement,
        contextId: "2d",
        ...args: any[]
      ): CanvasRenderingContext2D | null {
        return contextId === "2d" ? canvasContextStub : null;
      } as any
    );

    Object.defineProperty(globalThis, "ResizeObserver", {
      configurable: true,
      writable: true,
      value: ResizeObserverStub,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();

    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      configurable: true,
      writable: true,
      value: originalGetContext,
    });

    Object.defineProperty(globalThis, "ResizeObserver", {
      configurable: true,
      writable: true,
      value: originalResizeObserver,
    });

    document.body.innerHTML = "";
  });

  it("should resolve both circle shapes inside one mr-draggable", async () => {
    document.body.innerHTML = `
      <mr-canvas>
        <mr-draggable>
          <mr-circle-shape center='{"x":400,"y":200}' radius="30" fill="pink"></mr-circle-shape>
          <mr-circle-shape center='{"x":700,"y":300}' radius="30" fill="gray"></mr-circle-shape>
        </mr-draggable>
      </mr-canvas>
    `;

    const canvas = document.querySelector("mr-canvas");

    expect(canvas).toBeInstanceOf(MrCanvas);

    if (!(canvas instanceof MrCanvas)) {
      throw new Error("Expected mr-canvas to be an instance of MrCanvas.");
    }

    await canvas.updateComplete;

    const controller = (canvas as unknown as ShapeControllerAccessor).shapeController;
    const shapes = controller.getShapes();

    expect(shapes).toHaveLength(2);
    expect(shapes[0]).toBeInstanceOf(CircleShape);
    expect(shapes[1]).toBeInstanceOf(CircleShape);

    expect(shapes[0]?.getCenter().x).toBe(400);
    expect(shapes[0]?.getCenter().y).toBe(200);
    expect(shapes[1]?.getCenter().x).toBe(700);
    expect(shapes[1]?.getCenter().y).toBe(300);
  });
});