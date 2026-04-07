import type { IGraphElementController, GraphElementControllerHost } from "../../GraphElementControllers.js";
import type { GraphBoxClickDetail } from "./GraphBoxClickDetail.js";


export class GraphBoxClickController implements IGraphElementController {
  private host: GraphElementControllerHost | undefined;

  bind(host: GraphElementControllerHost): void {
    this.host = host;
  }

  hostConnected(): void { }

  hostDisconnected(): void { }

  onBoxClick(_detail: GraphBoxClickDetail): void { }

  handleBoxClick(boxId: string, originalEvent: MouseEvent): void {
    if (this.host === undefined) {
      throw new Error("GraphBoxClickController must be bound before use.");
    }

    const scene = this.host.getScene();
    const box = scene.nodes.find((candidate) => candidate.id === boxId);

    if (box === undefined) {
      throw new Error(`Graph box '${boxId}' was not found in the current scene.`);
    }

    this.host.notifyBoxClick({
      box,
      scene,
      originalEvent,
    });
  }
}
