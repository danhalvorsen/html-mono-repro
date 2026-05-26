import { describe, expect, it } from "vitest";
import type { AstarEngineStepEvent } from "../../src/contracts/AstarVisualizerContracts.js";
import { AstarVisualizerFixture } from "../fixtures/AstarVisualizerFixture.js";

function assertValidStepSequence(steps: ReadonlyArray<AstarEngineStepEvent>): void {
  if (steps.length === 0) {
    throw new Error("Step sequence must not be empty.");
  }

  const first = steps[0];
  if (first?.kind !== "started") {
    throw new Error("First step must be started.");
  }

  const last = steps[steps.length - 1];
  if (last?.kind !== "path-found" && last?.kind !== "no-path") {
    throw new Error("Last step must be path-found or no-path.");
  }

  for (let index = 0; index < steps.length; index += 1) {
    const current = steps[index];
    if (current === undefined) {
      throw new Error("Step sequence contains undefined entries.");
    }

    if (index > 0) {
      const previous = steps[index - 1];
      if (previous === undefined) {
        throw new Error("Step sequence contains undefined entries.");
      }

      if (current.sequence !== previous.sequence + 1) {
        throw new Error("Step sequence must increment by exactly one.");
      }

      if (current.elapsedMs < previous.elapsedMs) {
        throw new Error("Elapsed milliseconds must be monotonic non-decreasing.");
      }

      if (current.evaluatedNodes < previous.evaluatedNodes) {
        throw new Error("Evaluated node count must be monotonic non-decreasing.");
      }
    }

    if (current.openSize < 0 || current.closedSize < 0) {
      throw new Error("Open and closed sizes must never be negative.");
    }

    if (current.kind === "started" || current.kind === "no-path") {
      if (current.coordinate !== null) {
        throw new Error("Global steps must not target a coordinate.");
      }
    }

    if (
      current.kind === "node-opened"
      || current.kind === "node-closed"
      || current.kind === "cost-updated"
    ) {
      if (current.coordinate === null) {
        throw new Error("Node steps must target a coordinate.");
      }
    }

    if (current.kind === "path-found") {
      if (current.path === null || current.path.length === 0) {
        throw new Error("Path-found must contain a non-empty path.");
      }
    } else if (current.path !== null) {
      throw new Error("Only path-found may include a path.");
    }
  }
}

describe("AstarEngineStepEvent sequence contracts", () => {
  const fixture = new AstarVisualizerFixture();

  it("accepts a valid started -> node -> terminal sequence", () => {
    const steps: AstarEngineStepEvent[] = [
      fixture.createStartedStep(1),
      {
        ...fixture.createStartedStep(2),
        kind: "node-opened",
        coordinate: { row: 1, col: 1 },
        current: { row: 1, col: 0 },
        costs: { g: 1, h: 2, f: 3 },
        parent: { row: 1, col: 0 },
        evaluatedNodes: 1,
        openSize: 2,
        closedSize: 0,
        elapsedMs: 3,
      },
      fixture.createPathFoundStep(3),
    ];

    expect(() => assertValidStepSequence(steps)).not.toThrow();
  });

  it("rejects non-contiguous sequence ids", () => {
    const steps: AstarEngineStepEvent[] = [
      fixture.createStartedStep(1),
      fixture.createPathFoundStep(3),
    ];

    expect(() => assertValidStepSequence(steps)).toThrow(
      "Step sequence must increment by exactly one.",
    );
  });

  it("rejects node step without a coordinate", () => {
    const steps: AstarEngineStepEvent[] = [
      fixture.createStartedStep(1),
      {
        ...fixture.createStartedStep(2),
        kind: "node-closed",
      },
      fixture.createPathFoundStep(3),
    ];

    expect(() => assertValidStepSequence(steps)).toThrow(
      "Node steps must target a coordinate.",
    );
  });

  it("rejects non path-found step carrying a path", () => {
    const steps: AstarEngineStepEvent[] = [
      fixture.createStartedStep(1),
      {
        ...fixture.createStartedStep(2),
        kind: "node-opened",
        coordinate: { row: 0, col: 1 },
        path: [{ row: 0, col: 1 }],
      },
      fixture.createPathFoundStep(3),
    ];

    expect(() => assertValidStepSequence(steps)).toThrow(
      "Only path-found may include a path.",
    );
  });
});
