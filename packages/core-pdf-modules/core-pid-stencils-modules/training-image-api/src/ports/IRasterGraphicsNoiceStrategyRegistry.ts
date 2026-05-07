import type { IRasterGraphicsNoiceStrategy } from "./IRasterGraphicsNoiceStrategy.js";

export interface IRasterGraphicsNoiceStrategyRegistry {
  get(name: string): IRasterGraphicsNoiceStrategy;
}