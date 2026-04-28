import type { IDagGraph } from "@monorepo/core-graph";
import type {
  GraphBoxRightClickDetail,
  GraphConnectionPointRightClickDetail,
  GraphElementControllerHost,
  GraphSvgNodeShapeObject,
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
    const parentNodeId = this.resolveParentNodeId(detail.box.id);
    const selectedConnectorRole = this.resolveCurrentConnectorRole(parentNodeId);

    if (selectedConnectorRole !== undefined) {
      this.selectionState.setDefaultConnectorRole(parentNodeId, selectedConnectorRole);
    }

    this.attachChildNode(parentNodeId, selectedConnectorRole);
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
    this.applyInitialChildPosition(parentNode.id, childNode.id, resolvedConnectorRole);
    this.selectionState.select(childNode.id);
    this.activityState.setActive(
      "DagNodeExpansionController",
      resolvedConnectorRole === undefined
        ? `Added child node ${childNode.id} to ${parentNode.id}.`
        : `Added child node ${childNode.id} from ${parentNode.id}.${resolvedConnectorRole}.`,
    );
    this.host?.requestGraphUpdate();
  }

  private applyInitialChildPosition(
    parentNodeId: string,
    childNodeId: string,
    connectorRole: string | undefined,
  ): void {
    const parentSceneNode = this.host?.getScene().nodes.find((candidate) => candidate.id === parentNodeId);

    if (parentSceneNode === undefined || this.host === undefined) {
      return;
    }

    const childCenter = this.createChildCenter(parentSceneNode, connectorRole);
    this.host.setNodePositionOverride(childNodeId, childCenter);
  }

  private createChildCenter(
    parentNode: GraphSvgNodeShapeObject,
    connectorRole: string | undefined,
  ): { x: number; y: number } {
    const placementDistance = Math.max(parentNode.box.width, parentNode.box.height) * 2.2;
    const connector = parentNode.connectionPoints.find((candidate) => candidate.role === connectorRole)?.connector;

    if (connector !== undefined) {
      const vectorX = connector.x - parentNode.center.x;
      const vectorY = connector.y - parentNode.center.y;
      const vectorLength = Math.hypot(vectorX, vectorY);

      if (vectorLength > 0) {
        return {
          x: parentNode.center.x + ((vectorX / vectorLength) * placementDistance),
          y: parentNode.center.y + ((vectorY / vectorLength) * placementDistance),
        };
      }
    }

    switch (connectorRole) {
      case "top":
        return { x: parentNode.center.x, y: parentNode.center.y - placementDistance };
      case "right":
        return { x: parentNode.center.x + placementDistance, y: parentNode.center.y };
      case "bottom":
        return { x: parentNode.center.x, y: parentNode.center.y + placementDistance };
      case "left":
        return { x: parentNode.center.x - placementDistance, y: parentNode.center.y };
      default:
        return { x: parentNode.center.x + placementDistance, y: parentNode.center.y };
    }
  }

  private resolveCurrentConnectorRole(nodeId: string): string | undefined {
    const highlightedConnectionPointId = this.host?.getHighlightedConnectionPointId();

    if (highlightedConnectionPointId === undefined) {
      return this.selectionState.getDefaultConnectorRole(nodeId);
    }

    const currentNode = this.host?.getScene().nodes.find((candidate) => candidate.id === nodeId);

    if (currentNode === undefined) {
      return this.selectionState.getDefaultConnectorRole(nodeId);
    }

    const highlightedConnectionPoint = currentNode.connectionPoints
      .find((connectionPoint) => connectionPoint.id === highlightedConnectionPointId);

    if (highlightedConnectionPoint === undefined) {
      return this.selectionState.getDefaultConnectorRole(nodeId);
    }

    return highlightedConnectionPoint.role;
  }

  private resolveParentNodeId(clickedNodeId: string): string {
    const highlightedNodeId = this.host?.getHighlightedNodeId();
    const selectedNodeId = this.selectionState.selectedNodeId;

    if (this.hasNode(highlightedNodeId)) {
      return highlightedNodeId;
    }

    if (this.hasNode(selectedNodeId)) {
      return selectedNodeId;
    }

    return clickedNodeId;
  }

  private hasNode(nodeId: string | undefined): nodeId is string {
    if (nodeId === undefined || nodeId === "none") {
      return false;
    }

    return this.graph.nodes.some((candidate) => candidate.id === nodeId);
  }

  private createNodeId(parentNodeId: string): string {
    const nodeId = `${parentNodeId}-${this.nextNodeNumber}`;
    this.nextNodeNumber += 1;
    return nodeId;
  }
}
