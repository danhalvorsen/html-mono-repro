import type { IGraphElementController, GraphElementControllerHost } from "src/GraphElementControllers.js";
import { GraphEdgeClickDetail } from "./EdgeControllers.js";


export class GraphEdgeClickController implements IGraphElementController {
  private host: GraphElementControllerHost | undefined;

  bind(host: GraphElementControllerHost): void {
    this.host = host;
  }

  hostConnected(): void { }

  hostDisconnected(): void { }

  onEdgeClick(_detail: GraphEdgeClickDetail): void { }

  handleEdgeClick(edgeId: string, originalEvent: MouseEvent): void {
    if (this.host === undefined) {
      throw new Error("GraphEdgeClickController must be bound before use.");
    }

    const scene = this.host.getScene();
    const edge = scene.edges.find((candidate) => candidate.id === edgeId);

    if (edge === undefined) {
      throw new Error(`Graph edge '${edgeId}' was not found in the current scene.`);
    }

    this.host.notifyEdgeClick({
      edge,
      scene,
      originalEvent,
    });
  }
}
