import type { PlotMenuCommand } from "../domain/plot-menu-command.js";
import type { PlotDefinition } from "../domain/plot-definition.js";
import { PlotRegistry } from "../services/plot-registry.js";

export interface PlotMenuSnapshot {
  readonly plots: readonly PlotDefinition[];
  readonly selectedPlotId: string | null;
}

export class PlotMenuController {
  private readonly registry: PlotRegistry;
  private selectedPlotId: string | null = null;

  public constructor(registry: PlotRegistry = new PlotRegistry()) {
    this.registry = registry;
  }

  public register(plot: PlotDefinition): void {
    this.registry.add(plot);
  }

  public dispatch(command: PlotMenuCommand): void {
    switch (command.type) {
      case "select":
        this.selectedPlotId = this.registry.getById(command.plotId) === null ? null : command.plotId;
        return;
      case "toggle-visible": {
        const current = this.registry.getById(command.plotId);
        if (current !== null) {
          this.registry.update({
            ...current,
            visible: !current.visible,
          });
        }
        return;
      }
      case "remove":
        this.registry.remove(command.plotId);
        if (this.selectedPlotId === command.plotId) {
          this.selectedPlotId = null;
        }
        return;
    }
  }

  public snapshot(): PlotMenuSnapshot {
    return {
      plots: this.registry.getAll(),
      selectedPlotId: this.selectedPlotId,
    };
  }
}
