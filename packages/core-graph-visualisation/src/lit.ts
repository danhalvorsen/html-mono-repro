import type { IGraph } from "@monorepo/core-graph";
import { LitElement, css, html, svg, type PropertyValues, type TemplateResult } from "lit";

import {
  GraphBoxClickController,
  GraphBoxRightClickController,
  GraphConnectionPointDragController,
  GraphConnectionPointClickController,
  GraphConnectionPointRightClickController,
  GraphEdgeClickController,
  OnDragNodeController,
  GraphElementControllerRegistry,
  type GraphBoxClickDetail,
  type GraphConnectionPointConnectDetail,
  type GraphConnectionPointEdgeDraft,
  type GraphConnectionPointClickDetail,
  type GraphConnectionPointRightClickDetail,
  type GraphBoxRightClickDetail,
  type GraphEdgeClickDetail,
  type GraphElementControllerHost,
  type IGraphElementController,
} from "./GraphElementControllers.js";
import type { IGraphConstraintEngine } from "./GraphConstraints.js";
import {
  type GraphSvgConnector,
  GraphSvgSceneFactory,
  type GraphSceneOptions,
  type GraphSvgScene,
  type IGraphSvgSceneFactory,
} from "./GraphSvgScene.js";
import { GridGraphConstraintEngine } from "./GridGraphConstraintEngine.js";

export const CORE_GRAPH_VISUALIZER_TAG = "mr-core-graph-visualizer";

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;
const DEFAULT_PADDING = 48;
const DEFAULT_NODE_WIDTH = 112;
const DEFAULT_NODE_HEIGHT = 56;

export class CoreGraphVisualizerElement extends LitElement implements GraphElementControllerHost {
  static override properties = {
    graph: { attribute: false },
    width: { type: Number },
    height: { type: Number },
    padding: { type: Number },
    boxWidth: { type: Number, attribute: "box-width" },
    boxHeight: { type: Number, attribute: "box-height" },
    controllers: { attribute: false },
  };

  static override styles = css`
    :host {
      display: block;
    }

    svg {
      display: block;
      width: 100%;
      height: auto;
      overflow: visible;
      background: #ffffff;
    }

    .edge {
      fill: none;
      stroke: #7c8aa5;
      stroke-width: 2;
      cursor: pointer;
      transition: stroke 160ms ease, stroke-width 160ms ease, filter 160ms ease;
    }

    .edge--highlighted {
      stroke: #cf5f17;
      stroke-width: 5;
      filter: drop-shadow(0 0 8px rgba(207, 95, 23, 0.45));
    }

    .edge--draft {
      stroke: #cf5f17;
      stroke-width: 3;
      stroke-dasharray: 8 6;
      opacity: 0.9;
      pointer-events: none;
    }

    .node--highlighted {
      fill: #2f5b90;
      stroke: #f6b36a;
      stroke-width: 3;
      filter: drop-shadow(0 0 8px rgba(246, 179, 106, 0.35));
    }

    .connection-point {
      fill: #ffffff;
      stroke: #2f5b90;
      stroke-width: 2;
      cursor: pointer;
      transition: fill 160ms ease, stroke 160ms ease, filter 160ms ease;
    }

    .connection-point--highlighted {
      fill: #f6b36a;
      stroke: #cf5f17;
      stroke-width: 3;
      filter: drop-shadow(0 0 6px rgba(207, 95, 23, 0.35));
    }

    .boundary {
      fill: #f8fbff;
      stroke: #8aa0bd;
      stroke-width: 2;
    }

    .node {
      fill: #1f3a5f;
      stroke: #dce6f2;
      stroke-width: 2;
      rx: 8;
      ry: 8;
    }

    .label {
      fill: #10233d;
      font-family: "Segoe UI", sans-serif;
      font-size: 12px;
      text-anchor: middle;
    }

    .node-slot-shell {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #f8fbff;
      font-family: "Segoe UI", sans-serif;
      font-size: 12px;
      text-align: center;
      pointer-events: none;
      box-sizing: border-box;
      padding: 6px;
    }

    .node-slot-label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    ::slotted(*) {
      color: inherit;
      font: inherit;
    }
  `;

  graph: IGraph | undefined;
  width = DEFAULT_WIDTH;
  height = DEFAULT_HEIGHT;
  padding = DEFAULT_PADDING;
  boxWidth = DEFAULT_NODE_WIDTH;
  boxHeight = DEFAULT_NODE_HEIGHT;
  controllers: readonly IGraphElementController[] = [];

  private readonly sceneFactory: IGraphSvgSceneFactory;
  private readonly controllerRegistry: GraphElementControllerRegistry;
  private readonly graphBoxClickController = new GraphBoxClickController();
  private readonly graphBoxRightClickController = new GraphBoxRightClickController();
  private readonly graphConnectionPointClickController = new GraphConnectionPointClickController();
  private readonly graphConnectionPointRightClickController = new GraphConnectionPointRightClickController();
  private readonly graphConnectionPointDragController = new GraphConnectionPointDragController();
  private readonly graphEdgeClickController = new GraphEdgeClickController();
  private readonly graphNodeDragController = new OnDragNodeController();
  private currentScene: GraphSvgScene;
  private highlightedNodeId: string | undefined;
  private highlightedConnectionPointId: string | undefined;
  private hoveredConnectionPointId: string | undefined;
  private highlightedEdgeId: string | undefined;
  private connectionPointEdgeDraft: GraphConnectionPointEdgeDraft | undefined;
  private readonly nodePositionOverrides = new Map<string, GraphSvgConnector>();

  constructor(
    constraintEngine: IGraphConstraintEngine = new GridGraphConstraintEngine(),
    sceneFactory: IGraphSvgSceneFactory = new GraphSvgSceneFactory(constraintEngine),
  ) {
    super();
    this.sceneFactory = sceneFactory;
    this.controllerRegistry = new GraphElementControllerRegistry(this);
    this.currentScene = this.createEmptyScene();
    this.controllerRegistry.add(this.graphBoxClickController);
    this.controllerRegistry.add(this.graphBoxRightClickController);
    this.controllerRegistry.add(this.graphConnectionPointClickController);
    this.controllerRegistry.add(this.graphConnectionPointRightClickController);
    this.controllerRegistry.add(this.graphConnectionPointDragController);
    this.controllerRegistry.add(this.graphEdgeClickController);
    this.controllerRegistry.add(this.graphNodeDragController);
  }

  override render(): TemplateResult {
    const baseScene = this.graph === undefined
      ? this.createEmptyScene()
      : this.sceneFactory.createScene(this.graph, this.createSceneOptions());
    const scene = this.applyNodePositionOverrides(baseScene);
    this.currentScene = scene;

    return html`${this.renderSvg(scene)}`;
  }

  override updated(changedProperties: PropertyValues<this>): void {
    super.updated(changedProperties);

    if (changedProperties.has("controllers")) {
      this.controllerRegistry.addRange(this.controllers);
    }

    this.propagateNodeSlotProperties(this.currentScene);
  }

  private renderSvg(scene: GraphSvgScene): TemplateResult {
    const normalEdges = scene.edges.filter((edge) => edge.id !== this.highlightedEdgeId);
    const highlightedEdge = scene.edges.find((edge) => edge.id === this.highlightedEdgeId);
    const draftEdgePath = this.connectionPointEdgeDraft === undefined
      ? undefined
      : `M ${this.connectionPointEdgeDraft.sourceConnector.x} ${this.connectionPointEdgeDraft.sourceConnector.y} L ${this.connectionPointEdgeDraft.currentConnector.x} ${this.connectionPointEdgeDraft.currentConnector.y}`;

    return svg`
      <svg
        viewBox="0 0 ${scene.width} ${scene.height}"
        width=${scene.width}
        height=${scene.height}
        role="img"
        aria-label="Graph visualization"
      >
        <rect
          class="boundary"
          x=${scene.boundary.topLeft.x}
          y=${scene.boundary.topLeft.y}
          width=${scene.boundary.width}
          height=${scene.boundary.height}
        ></rect>
        ${normalEdges.map((edge) => this.renderEdge(edge, false))}
        ${scene.nodes.map((node) => svg`
          <g>
            <rect
              class=${node.id === this.highlightedNodeId ? "node node--highlighted" : "node"}
              x=${node.box.topLeft.x}
              y=${node.box.topLeft.y}
              width=${node.box.width}
              height=${node.box.height}
              @click=${(event: MouseEvent) => this.onBoxClick(node.id, event)}
              @contextmenu=${(event: MouseEvent) => this.onBoxRightClick(node.id, event)}
              @pointerdown=${(event: PointerEvent) => this.onNodePointerDown(node.id, event)}
            ></rect>
            <foreignObject
              x=${node.box.topLeft.x}
              y=${node.box.topLeft.y}
              width=${node.box.width}
              height=${node.box.height}
              @click=${(event: MouseEvent) => this.onBoxClick(node.id, event)}
              @contextmenu=${(event: MouseEvent) => this.onBoxRightClick(node.id, event)}
              @pointerdown=${(event: PointerEvent) => this.onNodePointerDown(node.id, event)}
            >
              <div xmlns="http://www.w3.org/1999/xhtml" class="node-slot-shell">
                <slot
                  name=${this.getNodeSlotName(node.id)}
                  data-node-slot=${node.id}
                >
                  <span class="node-slot-label">${node.label}</span>
                </slot>
              </div>
            </foreignObject>
            ${node.id === this.highlightedNodeId || this.connectionPointEdgeDraft !== undefined
              ? node.connectionPoints.map((connectionPoint) => svg`
                <circle
                  class=${this.getConnectionPointClass(connectionPoint.id)}
                  cx=${connectionPoint.connector.x}
                  cy=${connectionPoint.connector.y}
                  r="6"
                  @pointerdown=${(event: PointerEvent) =>
                    this.onConnectionPointPointerDown(node.id, connectionPoint.id, event)}
                  @pointerenter=${() =>
                    this.onConnectionPointPointerEnter(connectionPoint.id)}
                  @pointerleave=${() =>
                    this.onConnectionPointPointerLeave(connectionPoint.id)}
                  @click=${(event: MouseEvent) =>
                    this.onConnectionPointClick(node.id, connectionPoint.id, event)}
                  @contextmenu=${(event: MouseEvent) =>
                    this.onConnectionPointRightClick(node.id, connectionPoint.id, event)}
                ></circle>
              `)
              : null}
          </g>
        `)}
        ${highlightedEdge === undefined ? null : this.renderEdge(highlightedEdge, true)}
        ${draftEdgePath === undefined ? null : svg`
          <path class="edge edge--draft" d=${draftEdgePath}></path>
        `}
      </svg>
    `;
  }

  private renderEdge(
    edge: GraphSvgScene["edges"][number],
    highlighted: boolean,
  ): TemplateResult {
    return svg`
      <g data-edge-id=${edge.id}>
        <path
          class=${highlighted ? "edge edge--highlighted" : "edge"}
          d=${edge.edge.path}
          @click=${(event: MouseEvent) => this.onEdgeClick(edge.id, event)}
        ></path>
        ${highlighted ? svg`
          <circle
            class="connection-point connection-point--highlighted"
            cx=${edge.start.connector.x}
            cy=${edge.start.connector.y}
            r="6"
          ></circle>
          <circle
            class="connection-point connection-point--highlighted"
            cx=${edge.end.connector.x}
            cy=${edge.end.connector.y}
            r="6"
          ></circle>
        ` : null}
      </g>
    `;
  }

  private createSceneOptions(): GraphSceneOptions {
    return {
      width: this.width,
      height: this.height,
      padding: this.padding,
      boxWidth: this.boxWidth,
      boxHeight: this.boxHeight,
    };
  }

  private createEmptyScene(): GraphSvgScene {
    return {
      width: this.width,
      height: this.height,
      boundary: {
        topLeft: {
          x: 0,
          y: 0,
        },
        width: this.width,
        height: this.height,
      },
      nodes: [],
      edges: [],
    };
  }

  getScene(): GraphSvgScene {
    return this.currentScene;
  }

  requestGraphUpdate(): void {
    this.requestUpdate();
  }

  mapClientPointToSvg(clientX: number, clientY: number): GraphSvgConnector {
    const svgElement = this.renderRoot.querySelector("svg");

    if (!(svgElement instanceof SVGSVGElement)) {
      return { x: clientX, y: clientY };
    }

    const rect = svgElement.getBoundingClientRect();
    const viewBox = svgElement.viewBox.baseVal;
    const normalizedX = rect.width === 0 ? 0 : (clientX - rect.left) / rect.width;
    const normalizedY = rect.height === 0 ? 0 : (clientY - rect.top) / rect.height;

    return {
      x: viewBox.x + (normalizedX * viewBox.width),
      y: viewBox.y + (normalizedY * viewBox.height),
    };
  }

  setNodePositionOverride(nodeId: string, center: GraphSvgConnector): void {
    const node = this.currentScene.nodes.find((candidate) => candidate.id === nodeId);

    if (node === undefined) {
      return;
    }

    const halfWidth = node.box.width / 2;
    const halfHeight = node.box.height / 2;
    const minimumX = this.currentScene.boundary.topLeft.x + halfWidth;
    const maximumX = this.currentScene.boundary.topLeft.x + this.currentScene.boundary.width - halfWidth;
    const minimumY = this.currentScene.boundary.topLeft.y + halfHeight;
    const maximumY = this.currentScene.boundary.topLeft.y + this.currentScene.boundary.height - halfHeight;

    this.nodePositionOverrides.set(nodeId, {
      x: Math.min(Math.max(center.x, minimumX), maximumX),
      y: Math.min(Math.max(center.y, minimumY), maximumY),
    });
  }

  getHighlightedNodeId(): string | undefined {
    return this.highlightedNodeId;
  }

  setHighlightedNodeId(nodeId: string | undefined): void {
    this.highlightedNodeId = nodeId;
  }

  getHighlightedConnectionPointId(): string | undefined {
    return this.highlightedConnectionPointId;
  }

  setHighlightedConnectionPointId(connectionPointId: string | undefined): void {
    this.highlightedConnectionPointId = connectionPointId;
  }

  getHoveredConnectionPointId(): string | undefined {
    return this.hoveredConnectionPointId;
  }

  setHoveredConnectionPointId(connectionPointId: string | undefined): void {
    this.hoveredConnectionPointId = connectionPointId;
  }

  getHighlightedEdgeId(): string | undefined {
    return this.highlightedEdgeId;
  }

  setHighlightedEdgeId(edgeId: string | undefined): void {
    this.highlightedEdgeId = edgeId;
  }

  getConnectionPointEdgeDraft(): GraphConnectionPointEdgeDraft | undefined {
    return this.connectionPointEdgeDraft;
  }

  setConnectionPointEdgeDraft(draft: GraphConnectionPointEdgeDraft | undefined): void {
    this.connectionPointEdgeDraft = draft;
  }

  notifyBoxClick(detail: GraphBoxClickDetail): void {
    this.dispatchEvent(new CustomEvent("graph-box:click", {
      bubbles: true,
      composed: true,
      detail,
    }));

    this.controllers.forEach((controller) => {
      controller.onBoxClick?.(detail);
    });
  }

  notifyBoxRightClick(detail: GraphBoxRightClickDetail): void {
    this.dispatchEvent(new CustomEvent("graph-box:right-click", {
      bubbles: true,
      composed: true,
      detail,
    }));

    this.controllers.forEach((controller) => {
      controller.onBoxRightClick?.(detail);
    });
  }

  notifyConnectionPointClick(detail: GraphConnectionPointClickDetail): void {
    this.dispatchEvent(new CustomEvent("graph-connection-point:click", {
      bubbles: true,
      composed: true,
      detail,
    }));

    this.controllers.forEach((controller) => {
      controller.onConnectionPointClick?.(detail);
    });
  }

  notifyConnectionPointRightClick(detail: GraphConnectionPointRightClickDetail): void {
    this.dispatchEvent(new CustomEvent("graph-connection-point:right-click", {
      bubbles: true,
      composed: true,
      detail,
    }));

    this.controllers.forEach((controller) => {
      controller.onConnectionPointRightClick?.(detail);
    });
  }

  notifyConnectionPointConnect(detail: GraphConnectionPointConnectDetail): void {
    this.dispatchEvent(new CustomEvent("graph-connection-point:connect", {
      bubbles: true,
      composed: true,
      detail,
    }));

    this.controllers.forEach((controller) => {
      controller.onConnectionPointConnect?.(detail);
    });
  }

  notifyEdgeClick(detail: GraphEdgeClickDetail): void {
    this.dispatchEvent(new CustomEvent("graph-edge:click", {
      bubbles: true,
      composed: true,
      detail,
    }));

    this.controllers.forEach((controller) => {
      controller.onEdgeClick?.(detail);
    });
  }

  private onBoxClick(boxId: string, event: MouseEvent): void {
    this.graphBoxClickController.handleBoxClick(boxId, event);
  }

  private onBoxRightClick(boxId: string, event: MouseEvent): void {
    event.preventDefault();
    this.graphBoxRightClickController.handleBoxRightClick(boxId, event);
  }

  private onEdgeClick(edgeId: string, event: MouseEvent): void {
    this.graphEdgeClickController.handleEdgeClick(edgeId, event);
  }

  private onConnectionPointClick(
    boxId: string,
    connectionPointId: string,
    event: MouseEvent,
  ): void {
    event.stopPropagation();
    this.graphConnectionPointClickController.handleConnectionPointClick(
      boxId,
      connectionPointId,
      event,
    );
  }

  private onConnectionPointPointerDown(
    boxId: string,
    connectionPointId: string,
    event: PointerEvent,
  ): void {
    event.stopPropagation();
    this.graphConnectionPointDragController.beginConnectionPointDrag(
      boxId,
      connectionPointId,
      event,
    );
  }

  private onConnectionPointPointerEnter(connectionPointId: string): void {
    this.graphConnectionPointDragController.handleConnectionPointPointerEnter(connectionPointId);
  }

  private onConnectionPointPointerLeave(connectionPointId: string): void {
    this.graphConnectionPointDragController.handleConnectionPointPointerLeave(connectionPointId);
  }

  private onConnectionPointRightClick(
    boxId: string,
    connectionPointId: string,
    event: MouseEvent,
  ): void {
    event.preventDefault();
    event.stopPropagation();
    this.graphConnectionPointRightClickController.handleConnectionPointRightClick(
      boxId,
      connectionPointId,
      event,
    );
  }

  private getNodeSlotName(nodeId: string): string {
    return `node-${nodeId}`;
  }

  private onNodePointerDown(nodeId: string, event: PointerEvent): void {
    this.graphNodeDragController.beginNodeDrag(nodeId, event);
  }

  private getConnectionPointClass(connectionPointId: string): string {
    const isHighlighted = connectionPointId === this.highlightedConnectionPointId;
    const isDraftSource = connectionPointId === this.connectionPointEdgeDraft?.sourceConnectionPointId;
    const isHovered = connectionPointId === this.hoveredConnectionPointId;

    return isHighlighted || isDraftSource || isHovered
      ? "connection-point connection-point--highlighted"
      : "connection-point";
  }

  private applyNodePositionOverrides(scene: GraphSvgScene): GraphSvgScene {
    if (this.nodePositionOverrides.size === 0) {
      return scene;
    }

    const nodes = scene.nodes.map((node) => {
      const overrideCenter = this.nodePositionOverrides.get(node.id);

      if (overrideCenter === undefined) {
        return node;
      }

      return {
        ...node,
        center: overrideCenter,
        box: {
          ...node.box,
          topLeft: {
            x: overrideCenter.x - (node.box.width / 2),
            y: overrideCenter.y - (node.box.height / 2),
          },
        },
        connectionPoints: node.connectionPoints.map((connectionPoint) => ({
          ...connectionPoint,
          connector: this.repositionConnectionPoint(node, overrideCenter, connectionPoint.role),
        })),
      };
    });

    const nodeLookup = new Map(nodes.map((node) => [node.id, node]));
    const edges = scene.edges.map((edge) => {
      const startNode = nodeLookup.get(edge.start.nodeId);
      const endNode = nodeLookup.get(edge.end.nodeId);

      if (startNode === undefined || endNode === undefined) {
        return edge;
      }

      const start = this.createNodeConnector(startNode, endNode);
      const end = this.createNodeConnector(endNode, startNode);

      return {
        ...edge,
        start: {
          ...edge.start,
          connector: start,
        },
        edge: {
          path: `M ${start.x} ${start.y} L ${end.x} ${end.y}`,
        },
        end: {
          ...edge.end,
          connector: end,
        },
      };
    });

    return {
      ...scene,
      nodes,
      edges,
    };
  }

  private createNodeConnector(
    from: GraphSvgScene["nodes"][number],
    to: GraphSvgScene["nodes"][number],
  ): GraphSvgConnector {
    const deltaX = to.center.x - from.center.x;
    const deltaY = to.center.y - from.center.y;
    const halfWidth = from.box.width / 2;
    const halfHeight = from.box.height / 2;

    if (Math.abs(deltaX) >= Math.abs(deltaY)) {
      return {
        x: from.center.x + (deltaX >= 0 ? halfWidth : -halfWidth),
        y: from.center.y,
      };
    }

    return {
      x: from.center.x,
      y: from.center.y + (deltaY >= 0 ? halfHeight : -halfHeight),
    };
  }

  private repositionConnectionPoint(
    node: GraphSvgScene["nodes"][number],
    center: GraphSvgConnector,
    role: GraphSvgScene["nodes"][number]["connectionPoints"][number]["role"],
  ): GraphSvgConnector {
    const halfWidth = node.box.width / 2;
    const halfHeight = node.box.height / 2;

    switch (role) {
      case "top":
        return { x: center.x, y: center.y - halfHeight };
      case "right":
        return { x: center.x + halfWidth, y: center.y };
      case "bottom":
        return { x: center.x, y: center.y + halfHeight };
      case "left":
        return { x: center.x - halfWidth, y: center.y };
    }
  }

  private propagateNodeSlotProperties(scene: GraphSvgScene): void {
    scene.nodes.forEach((node) => {
      const slot = this.renderRoot.querySelector<HTMLSlotElement>(`slot[data-node-slot="${node.id}"]`);

      if (slot === null) {
        return;
      }

      slot.assignedElements({ flatten: true }).forEach((element) => {
        if (!(element instanceof HTMLElement)) {
          return;
        }

        (element as HTMLElement & Record<string, unknown>).nodeId = node.id;
        (element as HTMLElement & Record<string, unknown>).nodeCenterX = node.center.x;
        (element as HTMLElement & Record<string, unknown>).nodeCenterY = node.center.y;
        (element as HTMLElement & Record<string, unknown>).nodeWidth = node.box.width;
        (element as HTMLElement & Record<string, unknown>).nodeHeight = node.box.height;
        element.style.setProperty("--node-center-x", `${node.center.x}`);
        element.style.setProperty("--node-center-y", `${node.center.y}`);
        element.style.setProperty("--node-width", `${node.box.width}`);
        element.style.setProperty("--node-height", `${node.box.height}`);
      });
    });
  }
}

export function registerCoreGraphVisualizerElement(): void {
  if (customElements.get(CORE_GRAPH_VISUALIZER_TAG) !== undefined) {
    return;
  }

  customElements.define(CORE_GRAPH_VISUALIZER_TAG, CoreGraphVisualizerElement);
}
