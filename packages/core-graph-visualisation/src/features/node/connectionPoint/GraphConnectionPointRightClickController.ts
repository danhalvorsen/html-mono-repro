import type { IGraphElementController, GraphElementControllerHost } from "src/GraphElementControllers.js";
import { resolveConnectionPointDetail } from "./NodeControllers.js";
import { GraphConnectionPointRightClickDetail } from "./GraphConnectionPointRightClickDetail.js";


export class GraphConnectionPointRightClickController implements IGraphElementController {
  private host: GraphElementControllerHost | undefined;

  bind(host: GraphElementControllerHost): void {
    this.host = host;
  }

  hostConnected(): void { }

  hostDisconnected(): void { }

  onConnectionPointRightClick(_detail: GraphConnectionPointRightClickDetail): void { }

  handleConnectionPointRightClick(
    boxId: string,
    connectionPointId: string,
    originalEvent: MouseEvent
  ): void {
    if (this.host === undefined) {
      throw new Error("GraphConnectionPointRightClickController must be bound before use.");
    }

    this.host.notifyConnectionPointRightClick(
      resolveConnectionPointDetail(this.host, boxId, connectionPointId, originalEvent)
    );
  }
}
