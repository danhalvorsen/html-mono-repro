import { describe, expect, it } from "vitest";
import { createStepper } from "../src/index.js";
import { AstarFixture } from "./fixtures/AstarFixture.js";

describe("AstarStepper payload completeness (failing-first)", () => {
  const fixture = new AstarFixture();

  it("step events should include runtime cost/state payload needed by visualizer", () => {
    const stepper = createStepper(
      fixture.createRequest({
        rows: 4,
        cols: 4,
        start: fixture.createCoordinate(0, 0),
        goal: fixture.createCoordinate(3, 3),
      }),
    );

    // consume started
    stepper.step();
    const step = stepper.step();

    expect(step).not.toBeNull();

    const payload = step as unknown as {
      current?: { row: number; col: number } | null;
      costs?: { g: number; h: number; f: number } | null;
      parent?: { row: number; col: number } | null;
      openSize?: number;
      closedSize?: number;
      elapsedMs?: number;
    };

    expect(payload.current).toBeDefined();
    expect(payload.costs).toBeDefined();
    expect(payload.parent).toBeDefined();
    expect(typeof payload.openSize).toBe("number");
    expect(typeof payload.closedSize).toBe("number");
    expect(typeof payload.elapsedMs).toBe("number");
  });
});
