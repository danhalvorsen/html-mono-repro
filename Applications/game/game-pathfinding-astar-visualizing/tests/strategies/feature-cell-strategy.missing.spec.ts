import { describe, expect, it } from "vitest";
import {
  CellPlacementStrategyRegistry,
  StartCellPlacementStrategy,
  GoalCellPlacementStrategy,
  WeightedWallCellPlacementStrategy,
  EraseCellPlacementStrategy,
} from "../../src/strategies/CellPlacementStrategies.js";

describe("feature: cell strategy pattern", () => {
  it("provides strategy classes for start/goal/weighted-wall/erase placement", () => {
    expect(typeof StartCellPlacementStrategy).toBe("function");
    expect(typeof GoalCellPlacementStrategy).toBe("function");
    expect(typeof WeightedWallCellPlacementStrategy).toBe("function");
    expect(typeof EraseCellPlacementStrategy).toBe("function");
  });

  it("provides a registry that resolves strategy by obstacle type", () => {
    const registry = new CellPlacementStrategyRegistry([
      new StartCellPlacementStrategy(),
      new GoalCellPlacementStrategy(),
      new WeightedWallCellPlacementStrategy(),
      new EraseCellPlacementStrategy(),
    ]);

    expect(registry.resolve("start")).toBeInstanceOf(StartCellPlacementStrategy);
    expect(registry.resolve("goal")).toBeInstanceOf(GoalCellPlacementStrategy);
    expect(registry.resolve("wall-50")).toBeInstanceOf(WeightedWallCellPlacementStrategy);
    expect(registry.resolve("unknown")).toBeInstanceOf(EraseCellPlacementStrategy);
  });
});
