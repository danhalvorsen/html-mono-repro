import type { IDagGraph } from "@monorepo/core-graph";
import type {
  GraphConnectionPointConnectDetail,
  GraphElementControllerHost,
  IGraphElementController,
} from "@monorepo/core-graph-visualisation";

import type { IControllerActivityState } from "./ControllerActivityState.js";
import type { INodeSelectionState } from "./NodeSelectionState.js";

export class DagConnectionPointEdgeController implements IGraphElementController {
  private host: GraphElementControllerHost | undefined;

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

  onConnectionPointConnect(detail: GraphConnectionPointConnectDetail): void {
    if (detail.sourceBox.id === detail.targetBox.id) {
      this.activityState.setActive(
        "DagConnectionPointEdgeController",
        `Skipped self-edge on ${detail.sourceBox.id}.`,
      );
      this.host?.requestGraphUpdate();
      return;
    }

    const sourceNode = this.graph.nodes.find((candidate) => candidate.id === detail.sourceBox.id);
    const targetNode = this.graph.nodes.find((candidate) => candidate.id === detail.targetBox.id);

    if (sourceNode === undefined || targetNode === undefined) {
      throw new Error("Source or target DAG node was not found during connection-point edge creation.");
    }

    const edgeAlreadyExists = this.graph.edges.some((edge) =>
      edge.source.id === sourceNode.id && edge.target.id === targetNode.id);

    if (edgeAlreadyExists) {
      this.activityState.setActive(
        "DagConnectionPointEdgeController",
        `Skipped duplicate edge ${sourceNode.id} -> ${targetNode.id}.`,
      );
      this.host?.requestGraphUpdate();
      return;
    }

    try {
      this.graph.addEdge(sourceNode, targetNode);
      this.selectionState.select(targetNode.id);
      this.activityState.setActive(
        "DagConnectionPointEdgeController",
        `Connected ${sourceNode.id}.${detail.sourceConnectionPoint.role} -> ${targetNode.id}.${detail.targetConnectionPoint.role}.`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown DAG edge creation error.";
      this.activityState.setActive(
        "DagConnectionPointEdgeController",
        `Failed to connect ${sourceNode.id} -> ${targetNode.id}: ${message}`,
      );
    }

    this.host?.requestGraphUpdate();
  }
}
