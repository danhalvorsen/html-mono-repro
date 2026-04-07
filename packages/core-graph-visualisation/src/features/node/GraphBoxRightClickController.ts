import type { IGraphElementController, GraphElementControllerHost } from "src/GraphElementControllers.js";
import { GraphBoxRightClickDetail } from "./GraphBoxRightClickDetail.js";


export class GraphBoxRightClickController implements IGraphElementController {
  private host: GraphElementControllerHost | undefined;

  bind(host: GraphElementControllerHost): void {
    this.host = host;
  }

  hostConnected(): void { }

  hostDisconnected(): void { }

  onBoxRightClick(_detail: GraphBoxRightClickDetail): void { }

  handleBoxRightClick(boxId: string, originalEvent: MouseEvent): void {
    if (this.host === undefined) {
      throw new Error("GraphBoxRightClickController must be bound before use.");
    }

    const scene = this.host.getScene();
    const box = scene.nodes.find((candidate) => candidate.id === boxId);

    if (box === undefined) {
      throw new Error(`Graph box '${boxId}' was not found in the current scene.`);
    }

    this.host.notifyBoxRightClick({
      box,
      scene,
      originalEvent,
    });
  }
}
