import type { IGraphElementController, GraphElementControllerHost } from "../../GraphElementControllers.js";
import { resolveConnectionPointDetail } from "./NodeControllers.js";
import type { GraphConnectionPointClickDetail } from "./GraphConnectionPointClickDetail.js";


export class GraphConnectionPointClickController implements IGraphElementController {
  private host: GraphElementControllerHost | undefined;

  bind(host: GraphElementControllerHost): void {
    this.host = host;
  }

  hostConnected(): void { }

  hostDisconnected(): void { }

  onConnectionPointClick(_detail: GraphConnectionPointClickDetail): void { }

  handleConnectionPointClick(
    boxId: string,
    connectionPointId: string,
    originalEvent: MouseEvent
  ): void {
    if (this.host === undefined) {
      throw new Error("GraphConnectionPointClickController must be bound before use.");
    }

    const detail = resolveConnectionPointDetail(this.host, boxId, connectionPointId, originalEvent);
    this.host.notifyConnectionPointClick(detail);
  }
}
