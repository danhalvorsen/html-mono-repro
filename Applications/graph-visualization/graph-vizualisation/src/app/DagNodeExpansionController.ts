import type { IDagGraph } from "@monorepo/core-graph";
import type {
  GraphBoxRightClickDetail,
  GraphConnectionPointRightClickDetail,
  GraphElementControllerHost,
  IGraphElementController,
} from "@monorepo/core-graph-visualisation";

import type { INodeSelectionState } from "./NodeSelectionState.js";
import type { IControllerActivityState } from "./ControllerActivityState.js";

export class DagNodeExpansionController implements IGraphElementController {
  private host: GraphElementControllerHost | undefined;
  private nextNodeNumber = 1;

  constructor(
    private readonly graph: IDagGraph,
    private readonly selectionState: INodeSelectionState,
    private readonly activityState: IControllerActivityState,
  ) {}

  bind(host: GraphElementControllerHost): void {
    this.host = host;
  }

  hostConnected(): void {}

  hostDisconnected(): void {}

  onBoxRightClick(detail: GraphBoxRightClickDetail): void {
    this.attachChildNode(detail.box.id);
  }

  onConnectionPointRightClick(detail: GraphConnectionPointRightClickDetail): void {
    this.selectionState.setDefaultConnectorRole(detail.box.id, detail.connectionPoint.role);
    this.attachChildNode(detail.box.id, detail.connectionPoint.role);
  }

  private attachChildNode(parentNodeId: string, connectorRole?: string): void {
    const resolvedConnectorRole = connectorRole ?? this.selectionState.getDefaultConnectorRole(parentNodeId);
    const parentNode = this.graph.nodes.find((candidate) => candidate.id === parentNodeId);

    if (parentNode === undefined) {
      throw new Error(`DAG node '${parentNodeId}' was not found.`);
    }

    const childNode = this.graph.addNode(this.createNodeId(parentNode.id));
    this.graph.addEdge(parentNode, childNode);
    this.selectionState.select(childNode.id);
    this.activityState.setActive(
      "DagNodeExpansionController",
      resolvedConnectorRole === undefined
        ? `Added child node ${childNode.id} to ${parentNode.id}.`
        : `Added child node ${childNode.id} from ${parentNode.id}.${resolvedConnectorRole}.`,
    );
    this.host?.requestGraphUpdate();
  }

  private createNodeId(parentNodeId: string): string {
    const nodeId = `${parentNodeId}-${this.nextNodeNumber}`;
    this.nextNodeNumber += 1;
    return nodeId;
  }
}
