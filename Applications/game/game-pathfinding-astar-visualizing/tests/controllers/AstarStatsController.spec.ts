import { describe, expect, it } from "vitest";
import { AstarStatsController } from "../../src/controllers/AstarStatsController.js";
import { AstarVisualizerFixture } from "../fixtures/AstarVisualizerFixture.js";

describe("AstarStatsController", () => {
  const fixture = new AstarVisualizerFixture();

  it("should calculate running stats from an engine step", () => {
    const controller = new AstarStatsController();
    const current = fixture.createIdleStats();

    const result = controller.calculate(
      {
        ...fixture.createStartedStep(),
        kind: "node-opened",
        evaluatedNodes: 2,
        openSize: 3,
        closedSize: 1,
        elapsedMs: 9,
      },
      current,
    );

    expect(result).toStrictEqual({
      evaluatedNodes: 2,
      openSize: 3,
      closedSize: 1,
      pathLength: null,
      elapsedMs: 9,
      status: "running",
    });
  });

  it("should calculate completed stats when a path is found", () => {
    const controller = new AstarStatsController();

    const result = controller.calculate(
      fixture.createPathFoundStep(),
      fixture.createIdleStats(),
    );

    expect(result).toStrictEqual({
      evaluatedNodes: 7,
      openSize: 0,
      closedSize: 7,
      pathLength: 3,
      elapsedMs: 15,
      status: "completed",
    });
  });

  it("should calculate failed stats when no path exists", () => {
    const controller = new AstarStatsController();

    const result = controller.calculate(
      {
        ...fixture.createStartedStep(),
        kind: "no-path",
        evaluatedNodes: 12,
        openSize: 0,
        closedSize: 12,
        elapsedMs: 20,
      },
      fixture.createIdleStats(),
    );

    expect(result).toStrictEqual({
      evaluatedNodes: 12,
      openSize: 0,
      closedSize: 12,
      pathLength: null,
      elapsedMs: 20,
      status: "failed",
    });
  });
});
