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
  private readonly layered = new DGMLLayeredLayoutStrategy({ direction: "top-to-bottom" });
  private readonly layeredTopToBottom = new DGMLLayeredLayoutStrategy({ direction: "top-to-bottom" });
  private readonly layeredBottomToTop = new DGMLLayeredLayoutStrategy({ direction: "bottom-to-top" });
  private readonly layeredLeftToRight = new DGMLLayeredLayoutStrategy({ direction: "left-to-right" });
  private readonly layeredRightToLeft = new DGMLLayeredLayoutStrategy({ direction: "right-to-left" });
  private readonly clustered = new DGMLLayeredLayoutStrategy({
    direction: "top-to-bottom",
    clusterByWeaklyConnectedComponents: true,
  });
  private readonly forceDirected = new DGMLForceDirectedLayoutStrategy();
  private readonly options: Required<DGMLLayoutStrategyResolverOptions>;

  constructor(options: DGMLLayoutStrategyResolverOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  resolve(request: GraphLayoutRequest): IGraphLayoutStrategy {
    switch (this.options.preferred) {
      case "force-directed":
        return this.forceDirected;
      case "layered-top-to-bottom":
        return this.layeredTopToBottom;
      case "layered-bottom-to-top":
        return this.layeredBottomToTop;
      case "layered-left-to-right":
        return this.layeredLeftToRight;
      case "layered-right-to-left":
        return this.layeredRightToLeft;
      case "clustered":
        return this.clustered;
      case "layered":
        break;
    }

    if (request.graph.nodes.length > this.options.maxLayeredNodeCount) {
      return this.forceDirected;
    }

    return this.layered;
  }
}
