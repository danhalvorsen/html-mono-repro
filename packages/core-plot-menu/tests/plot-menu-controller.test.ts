import { describe, expect, it } from "vitest";

import { PlotMenuController } from "../src/controllers/plot-menu-controller.js";

describe("PlotMenuController", () => {
  it("keeps plots in deterministic registration order", () => {
    const controller = new PlotMenuController();

    controller.register({
      id: "eq1",
      label: "eq1",
      expression: "x = 3",
      kind: "vertical-line",
      visible: true,
    });
    controller.register({
      id: "f",
      label: "f",
      expression: "y = 5",
      kind: "horizontal-line",
      visible: true,
    });

    expect(controller.snapshot().plots.map((plot) => plot.id)).toEqual(["eq1", "f"]);
  });

  it("supports selection, visibility toggle, and removal", () => {
    const controller = new PlotMenuController();

    controller.register({
      id: "g",
      label: "g",
      expression: "y = x^2",
      kind: "function",
      visible: true,
    });

    controller.dispatch({ type: "select", plotId: "g" });
    controller.dispatch({ type: "toggle-visible", plotId: "g" });

    expect(controller.snapshot().selectedPlotId).toBe("g");
    expect(controller.snapshot().plots[0]?.visible).toBe(false);

    controller.dispatch({ type: "remove", plotId: "g" });

    expect(controller.snapshot().selectedPlotId).toBeNull();
    expect(controller.snapshot().plots).toHaveLength(0);
  });
});
