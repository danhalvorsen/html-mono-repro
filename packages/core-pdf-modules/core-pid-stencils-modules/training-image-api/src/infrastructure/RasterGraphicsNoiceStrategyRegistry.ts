import type { IRasterGraphicsNoiceStrategy } from "../ports/IRasterGraphicsNoiceStrategy.js";
import type { IRasterGraphicsNoiceStrategyRegistry } from "../ports/IRasterGraphicsNoiceStrategyRegistry.js";

export class RasterGraphicsNoiceStrategyRegistry implements IRasterGraphicsNoiceStrategyRegistry {
  private readonly strategiesByName = new Map<string, IRasterGraphicsNoiceStrategy>();

  public constructor(strategies: readonly IRasterGraphicsNoiceStrategy[]) {
    for (const strategy of strategies) {
      this.strategiesByName.set(strategy.name, strategy);
    }
  }

  public get(name: string): IRasterGraphicsNoiceStrategy {
    const strategy = this.strategiesByName.get(name);

    if (strategy === undefined) {
      throw new Error(`Raster graphics noice strategy is not registered: ${name}`);
    }

    return strategy;
  }
}