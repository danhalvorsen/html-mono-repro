import { describe, expect, it } from "vitest";
import * as astarModule from "../src/index.js";
import { AstarPathfinder } from "../src/index.js";
import { AstarFixture } from "./fixtures/AstarFixture.js";

describe("Missing stepwise A* API (intentional failing tests)", () => {
  const fixture = new AstarFixture();

  it("should export createStepper(request) from package root", () => {
    expect(typeof (astarModule as Record<string, unknown>).createStepper).toBe("function");
  });

  it("should provide deterministic step events via stepper.step()", () => {
    const createStepper = (astarModule as {
      createStepper?: (request: ReturnType<AstarFixture["createRequest"]>) => {
        step: () => unknown;
      };
    }).createStepper;

    expect(createStepper).toBeDefined();

    const stepper = createStepper?.(
      fixture.createRequest({
        rows: 4,
        cols: 4,
        start: fixture.createCoordinate(0, 0),
        goal: fixture.createCoordinate(3, 3),
      }),
    );

    expect(stepper).toBeDefined();

    const first = stepper?.step() as { kind?: string } | null | undefined;
    expect(first?.kind).toBe("started");
  });

  it("should match findPath() result when run step-by-step to completion", () => {
    const createStepper = (astarModule as {
      createStepper?: (request: ReturnType<AstarFixture["createRequest"]>) => {
        step: () => { kind: string; path?: ReadonlyArray<{ row: number; col: number }> | null } | null;
      };
    }).createStepper;

    expect(createStepper).toBeDefined();

    const request = fixture.createRequest({
      rows: 5,
      cols: 5,
      start: fixture.createCoordinate(0, 0),
      goal: fixture.createCoordinate(4, 4),
    });

    const pathfinder = new AstarPathfinder();
    const expected = pathfinder.findPath(request);

    const stepper = createStepper?.(request);
    let finalStep: { kind: string; path?: ReadonlyArray<{ row: number; col: number }> | null } | null = null;

    for (let i = 0; i < 10_000; i += 1) {
      const step = stepper?.step() ?? null;
      if (step === null) {
        break;
      }

      if (step.kind === "path-found" || step.kind === "no-path") {
        finalStep = step;
        break;
      }
    }

    expect(finalStep).not.toBeNull();

    if (expected.kind === "path-found") {
      expect(finalStep?.kind).toBe("path-found");
      expect(finalStep?.path).toStrictEqual(expected.path);
    } else {
      expect(finalStep?.kind).toBe("no-path");
    }
  });
});
