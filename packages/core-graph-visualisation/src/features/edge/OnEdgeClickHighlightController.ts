import type { IGraphElementController, GraphElementControllerHost } from "../../GraphElementControllers.js";
import type { GraphEdgeClickDetail } from "./EdgeControllers.js";


export class OnEdgeClickHighlightController implements IGraphElementController {
  private host: GraphElementControllerHost | undefined;

  bind(host: GraphElementControllerHost): void {
    this.host = host;
  }

  hostConnected(): void { }

  hostDisconnected(): void { }

  onEdgeClick(detail: GraphEdgeClickDetail): void {
    this.host?.setHighlightedEdgeId(detail.edge.id);
    this.host?.setHighlightedNodeId(undefined);
    this.host?.requestGraphUpdate();
  }
}
