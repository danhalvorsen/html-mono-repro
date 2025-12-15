import { describe, it, expect, vi } from "vitest";
import { Mouse } from "../src/controllers/baseMouseController.js";
import { Position } from "../src/types/common/position.js";

class TestMouseController extends Mouse.BaseMouseController {
  dispose(): void {
    // no-op for tests
  }

  triggerMove(pos: Position): void {
    this.emitMove(pos);
  }

  triggerDown(pos: Position): void {
    this.emitDown(pos);
  }

  triggerUp(pos: Position): void {
    this.emitUp(pos);
  }

  triggerWheel(delta: number, pos: Position): void {
    this.emitWheel(delta, pos);
  }
}

describe("BaseMouseController", () => {
  it("emits move/down/up/wheel handlers", () => {
    const ctrl = new TestMouseController();
    const move = vi.fn();
    const down = vi.fn();
    const up = vi.fn();
    const wheel = vi.fn();

    ctrl.onMove(move);
    ctrl.onDown(down);
    ctrl.onUp(up);
    ctrl.onWheel(wheel);

    const p1: Position = { x: 1, y: 2 };
    const p2: Position = { x: 3, y: 4 };

    ctrl.triggerMove(p1);
    ctrl.triggerDown(p1);
    ctrl.triggerUp(p2);
    ctrl.triggerWheel(120, p2);

    expect(move).toHaveBeenCalledWith(p1);
    expect(down).toHaveBeenCalledWith(p1);
    expect(up).toHaveBeenCalledWith(p2);
    expect(wheel).toHaveBeenCalledWith(120, p2);
  });
});
