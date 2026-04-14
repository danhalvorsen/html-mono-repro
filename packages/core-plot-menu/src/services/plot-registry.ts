import type { PlotDefinition } from "../domain/plot-definition.js";

export class PlotRegistry {
  private readonly plots = new Map<string, PlotDefinition>();
  private readonly order: string[] = [];

  public add(plot: PlotDefinition): void {
    if (!this.plots.has(plot.id)) {
      this.order.push(plot.id);
    }

    this.plots.set(plot.id, plot);
  }

  public remove(plotId: string): void {
    this.plots.delete(plotId);
    const index = this.order.indexOf(plotId);
    if (index >= 0) {
      this.order.splice(index, 1);
    }
  }

  public getAll(): readonly PlotDefinition[] {
    return this.order
      .map((plotId) => this.plots.get(plotId))
      .filter((plot): plot is PlotDefinition => plot !== undefined);
  }

  public getById(plotId: string): PlotDefinition | null {
    return this.plots.get(plotId) ?? null;
  }

  public update(plot: PlotDefinition): void {
    if (!this.plots.has(plot.id)) {
      throw new Error(`Cannot update missing plot: ${plot.id}`);
    }

    this.plots.set(plot.id, plot);
  }
}
