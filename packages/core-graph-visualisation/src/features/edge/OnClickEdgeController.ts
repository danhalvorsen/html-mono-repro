import type { IGraphElementController, GraphElementControllerHost } from "src/GraphElementControllers.js";
import { GraphEdgeClickDetail } from "./EdgeControllers.js";


export class OnClickEdgeController implements IGraphElementController {
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
