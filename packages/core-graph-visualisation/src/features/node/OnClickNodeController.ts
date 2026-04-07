import type { IGraphElementController, GraphElementControllerHost } from "src/GraphElementControllers.js";
import { GraphBoxClickDetail } from "./GraphBoxClickDetail.js";


export class OnClickNodeController implements IGraphElementController {
  private host: GraphElementControllerHost | undefined;

  bind(host: GraphElementControllerHost): void {
    this.host = host;
  }

  hostConnected(): void { }

  hostDisconnected(): void { }

  onBoxClick(detail: GraphBoxClickDetail): void {
    this.host?.setHighlightedNodeId(detail.box.id);
    this.host?.setHighlightedConnectionPointId(undefined);
    this.host?.setHighlightedEdgeId(undefined);
    this.host?.requestGraphUpdate();
  }
}
