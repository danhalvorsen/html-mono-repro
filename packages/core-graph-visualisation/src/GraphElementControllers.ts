import type { ReactiveController, ReactiveControllerHost } from "lit";
import type { GraphSvgScene } from "./GraphSvgScene.js";
import type { GraphEdgeClickDetail } from "./features/edge/EdgeControllers.js";
import type { GraphConnectionPointRightClickDetail } from "./features/node/GraphConnectionPointRightClickDetail.js";
import type { GraphConnectionPointClickDetail } from "./features/node/GraphConnectionPointClickDetail.js";
import type { GraphBoxRightClickDetail } from "./features/node/GraphBoxRightClickDetail.js";
import type { GraphBoxClickDetail } from "./features/node/GraphBoxClickDetail.js";
import type { GraphConnectionPointConnectDetail } from "./features/node/GraphConnectionPointConnectDetail.js";
import type { GraphConnectionPointEdgeDraft } from "./features/node/GraphConnectionPointEdgeDraft.js";

export interface GraphElementControllerHost extends ReactiveControllerHost, EventTarget {
  getScene(): GraphSvgScene;
  requestGraphUpdate(): void;
  mapClientPointToSvg(clientX: number, clientY: number): GraphSvgScene["nodes"][number]["center"];
  setNodePositionOverride(nodeId: string, center: GraphSvgScene["nodes"][number]["center"]): void;
  getHighlightedNodeId(): string | undefined;
  setHighlightedNodeId(nodeId: string | undefined): void;
  getHighlightedConnectionPointId(): string | undefined;
  setHighlightedConnectionPointId(connectionPointId: string | undefined): void;
  getHoveredConnectionPointId(): string | undefined;
  setHoveredConnectionPointId(connectionPointId: string | undefined): void;
  getHighlightedEdgeId(): string | undefined;
  setHighlightedEdgeId(edgeId: string | undefined): void;
  getConnectionPointEdgeDraft(): GraphConnectionPointEdgeDraft | undefined;
  setConnectionPointEdgeDraft(draft: GraphConnectionPointEdgeDraft | undefined): void;
  notifyBoxClick(detail: GraphBoxClickDetail): void;
  notifyBoxRightClick(detail: GraphBoxRightClickDetail): void;
  notifyConnectionPointClick(detail: GraphConnectionPointClickDetail): void;
  notifyConnectionPointRightClick(detail: GraphConnectionPointRightClickDetail): void;
  notifyConnectionPointConnect(detail: GraphConnectionPointConnectDetail): void;
  notifyEdgeClick(detail: GraphEdgeClickDetail): void;
}

export interface IGraphElementController extends ReactiveController {
  bind(host: GraphElementControllerHost): void;
  onBoxClick?(detail: GraphBoxClickDetail): void;
  onBoxRightClick?(detail: GraphBoxRightClickDetail): void;
  onConnectionPointClick?(detail: GraphConnectionPointClickDetail): void;
  onConnectionPointRightClick?(detail: GraphConnectionPointRightClickDetail): void;
  onConnectionPointConnect?(detail: GraphConnectionPointConnectDetail): void;
  onEdgeClick?(detail: GraphEdgeClickDetail): void;
}

export class GraphElementControllerRegistry {
  private readonly controllers = new Set<IGraphElementController>();

  constructor(private readonly host: GraphElementControllerHost) {}

  add(controller: IGraphElementController): void {
    if (this.controllers.has(controller)) {
      return;
    }

    this.controllers.add(controller);
    controller.bind(this.host);
    this.host.addController(controller);
  }

  addRange(controllers: readonly IGraphElementController[]): void {
    controllers.forEach((controller) => this.add(controller));
  }
}

export * from "./features/node/NodeControllers.js";
export * from "./features/edge/EdgeControllers.js";
