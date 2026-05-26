import { describe, expect, it } from "vitest";
import { RecalculationController } from "./RecalculationController.js";
import { AstarGridEditorFixture } from "./tests/fixtures/AstarGridEditorFixture.js";

describe("RecalculationController", () => {
  const fixture = new AstarGridEditorFixture();

  it("should reset stats to idle when grid changes", () => {
    const controller = new RecalculationController();
    const enginePort = fixture.createFakeEnginePort();
    const snapshot = fixture.createEmptySnapshot();
    const runningStats = fixture.createRunningStats();

    const result = controller.recalculateAfterGridChange({
      snapshot,
      enginePort,
      stats: runningStats,
    });

    expect(result.stats).toStrictEqual({
      evaluatedNodes: 0,
      openSize: 0,
      closedSize: 0,
      pathLength: null,
      elapsedMs: 0,
      status: "idle",
    });
  });

  it("should reset engine port with the changed snapshot", () => {
    const controller = new RecalculationController();
    const enginePort = fixture.createFakeEnginePort();
    const snapshot = fixture.createEmptySnapshot();

    controller.recalculateAfterGridChange({
      snapshot,
      enginePort,
      stats: fixture.createRunningStats(),
    });

    expect(enginePort.resetCalls).toHaveLength(1);
    expect(enginePort.resetCalls[0]?.snapshot).toBe(snapshot);
  });

  it("should return the same snapshot instance that was used for recalculation", () => {
    const controller = new RecalculationController();
    const enginePort = fixture.createFakeEnginePort();
    const snapshot = fixture.createEmptySnapshot();

    const result = controller.recalculateAfterGridChange({
      snapshot,
      enginePort,
      stats: fixture.createRunningStats(),
    });

    expect(result.snapshot).toBe(snapshot);
  });
});
