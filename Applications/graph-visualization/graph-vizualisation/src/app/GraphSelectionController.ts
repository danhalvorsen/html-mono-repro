import type {
  GraphBoxClickDetail,
  GraphConnectionPointClickDetail,
  GraphElementControllerHost,
  IGraphElementController,
} from "@monorepo/core-graph-visualisation";

import type { INodeSelectionState } from "./NodeSelectionState.js";
import type { IControllerActivityState } from "./ControllerActivityState.js";

export class GraphSelectionController implements IGraphElementController {
  private host: GraphElementControllerHost | undefined;

  constructor(
    private readonly selectionState: INodeSelectionState,
    private readonly activityState: IControllerActivityState,
  ) {}

  bind(host: GraphElementControllerHost): void {
    this.host = host;
  }

  hostConnected(): void {}

  hostDisconnected(): void {}

  onBoxClick(detail: GraphBoxClickDetail): void {
    this.selectionState.select(detail.box.id);
    this.activityState.setActive(
      "GraphSelectionController",
      `Selected node ${detail.box.id}.`,
    );
    this.host?.requestGraphUpdate();
  }

  onConnectionPointClick(detail: GraphConnectionPointClickDetail): void {
    this.selectionState.setDefaultConnectorRole(detail.box.id, detail.connectionPoint.role);
    this.activityState.setActive(
      "GraphSelectionController",
      `Selected connector ${detail.box.id}.${detail.connectionPoint.role}.`,
    );
    this.host?.requestGraphUpdate();
  }
}
