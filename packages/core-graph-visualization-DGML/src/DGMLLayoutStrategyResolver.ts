import type {
  GraphLayoutRequest,
  IGraphLayoutStrategy,
  IGraphLayoutStrategyResolver,
} from "@monorepo/core-graph-visualisation/layout";

import { DGMLForceDirectedLayoutStrategy } from "./DGMLForceDirectedLayoutStrategy.js";
import { DGMLLayeredLayoutStrategy } from "./DGMLLayeredLayoutStrategy.js";
import type { DGMLLayoutKind } from "./DGMLLayoutTypes.js";

export interface DGMLLayoutStrategyResolverOptions {
  readonly preferred?: DGMLLayoutKind;
  readonly maxLayeredNodeCount?: number;
}

const DEFAULT_OPTIONS: Required<DGMLLayoutStrategyResolverOptions> = {
  preferred: "layered",
  maxLayeredNodeCount: 80,
};

export class DGMLLayoutStrategyResolver implements IGraphLayoutStrategyResolver {
  private readonly layered = new DGMLLayeredLayoutStrategy();
  private readonly forceDirected = new DGMLForceDirectedLayoutStrategy();
  private readonly options: Required<DGMLLayoutStrategyResolverOptions>;

  constructor(options: DGMLLayoutStrategyResolverOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  resolve(request: GraphLayoutRequest): IGraphLayoutStrategy {
    if (this.options.preferred === "force-directed") {
      return this.forceDirected;
    }

    if (request.graph.nodes.length > this.options.maxLayeredNodeCount) {
      return this.forceDirected;
    }

    return this.layered;
  }
}
