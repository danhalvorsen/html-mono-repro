import type { IGraphElementController, GraphElementControllerHost } from "../../../GraphElementControllers.js";
import type { GraphConnectionPointClickDetail } from "../GraphConnectionPointClickDetail.js";


export class OnClickConnectionPointController implements IGraphElementController {
  private host: GraphElementControllerHost | undefined;

  bind(host: GraphElementControllerHost): void {
    this.host = host;
  }

  hostConnected(): void { }

  hostDisconnected(): void { }

  onConnectionPointClick(detail: GraphConnectionPointClickDetail): void {
    this.host?.setHighlightedNodeId(detail.box.id);
    this.host?.setHighlightedConnectionPointId(detail.connectionPoint.id);
    this.host?.setHighlightedEdgeId(undefined);
    this.host?.requestGraphUpdate();
  }
}
