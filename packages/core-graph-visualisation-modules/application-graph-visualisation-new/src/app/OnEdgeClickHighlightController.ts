import type {
  GraphEdgeClickDetail,
  GraphElementControllerHost,
  IGraphElementController,
} from "@monorepo/core-graph-visualisation";

import type { IControllerActivityState } from "./ControllerActivityState.js";

export class OnEdgeClickHighlightController implements IGraphElementController {
  private host: GraphElementControllerHost | undefined;

  constructor(private readonly activityState: IControllerActivityState) {}

  bind(host: GraphElementControllerHost): void {
    this.host = host;
  }

  hostConnected(): void {}

  hostDisconnected(): void {}

  onEdgeClick(detail: GraphEdgeClickDetail): void {
    this.host?.setHighlightedEdgeId(detail.edge.id);
    this.activityState.setActive(
      "OnEdgeClickHighlightController",
      `Highlighted edge ${detail.edge.id}.`,
    );
    this.host?.requestGraphUpdate();
  }
}
