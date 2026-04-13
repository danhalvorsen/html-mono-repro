import type { IGraph } from "@monorepo/core-graph";
import { LitElement, css, html, type PropertyValues, type TemplateResult } from "lit";

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
  type GraphNodeVisualRepresentation,
  type GraphSceneOptions,
  type GraphSvgScene,
  type IGraphSvgSceneFactory,
} from "./GraphSvgScene.js";
import { GridGraphConstraintEngine } from "./GridGraphConstraintEngine.js";
import { GraphConnectorGeometry } from "./lit/GraphConnectorGeometry.js";
import { GraphHierarchyAnalyzer } from "./lit/GraphHierarchyAnalyzer.js";
import { GraphInteractionStateController } from "./lit/GraphInteractionStateController.js";
import { GraphNodeStyler } from "./lit/GraphNodeStyler.js";
import { ReactiveMouseController } from "./lit/ReactiveMouseController.js";
import { GraphSceneSvgRenderer } from "./lit/GraphSceneSvgRenderer.js";
import {
  GRAPH_EVENT_NAMES,
  type IGraphConnectorGeometry,
  type IGraphHierarchyAnalyzer,
  type IGraphNodeStyler,
  type IGraphNodeStylerFactory,
} from "./lit/contracts.js";
import type {
  GraphAutoScaleMetrics,
  GraphNodeHierarchy,
  GraphNodeVisualStyle,
} from "./lit/types.js";

export const CORE_GRAPH_VISUALIZER_TAG = "mr-core-graph-visualizer";
const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;
const DEFAULT_PADDING = 48;
const DEFAULT_NODE_WIDTH = 112;
const DEFAULT_NODE_HEIGHT = 56;

class GraphNodeStylerFactory implements IGraphNodeStylerFactory {
  create(boxWidth: number, boxHeight: number): IGraphNodeStyler {
    return new GraphNodeStyler(boxWidth, boxHeight);
  }
}

export class CoreGraphVisualizerElement extends LitElement implements GraphElementControllerHost {
  static override properties = {
    graph: { attribute: false },
    sceneFactory: { attribute: false },
    width: { type: Number },
    height: { type: Number },
    padding: { type: Number },
    boxWidth: { type: Number, attribute: "box-width" },
    boxHeight: { type: Number, attribute: "box-height" },
    nodeRepresentation: { type: String, attribute: "node-representation" },
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

    .edge-arrow {
      fill: #7c8aa5;
      pointer-events: none;
      transition: fill 160ms ease, filter 160ms ease;
    }

    .edge-arrow--highlighted {
      fill: #cf5f17;
      filter: drop-shadow(0 0 8px rgba(207, 95, 23, 0.45));
    }

    .edge-arrow--draft {
      fill: #cf5f17;
      opacity: 0.9;
      pointer-events: none;
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
      color: var(--node-label-color, #f8fbff);
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
  nodeRepresentation: GraphNodeVisualRepresentation = "box";
  controllers: readonly IGraphElementController[] = [];

  sceneFactory: IGraphSvgSceneFactory;
  private readonly controllerRegistry: GraphElementControllerRegistry;
  private readonly graphBoxClickController = new GraphBoxClickController();
  private readonly graphBoxRightClickController = new GraphBoxRightClickController();
  private readonly graphConnectionPointClickController = new GraphConnectionPointClickController();
  private readonly graphConnectionPointRightClickController = new GraphConnectionPointRightClickController();
  private readonly graphConnectionPointDragController = new GraphConnectionPointDragController();
  private readonly graphEdgeClickController = new GraphEdgeClickController();
  private readonly graphNodeDragController = new OnDragNodeController();
  private readonly hierarchyAnalyzer: IGraphHierarchyAnalyzer;
  private readonly connectorGeometry: IGraphConnectorGeometry;
  private readonly nodeStylerFactory: IGraphNodeStylerFactory;
  private readonly reactiveMouseController: ReactiveMouseController;
  private readonly interactionStateController: GraphInteractionStateController;
  private readonly sceneSvgRenderer = new GraphSceneSvgRenderer();
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
    hierarchyAnalyzer: IGraphHierarchyAnalyzer = new GraphHierarchyAnalyzer(),
    connectorGeometry: IGraphConnectorGeometry = new GraphConnectorGeometry(),
    nodeStylerFactory: IGraphNodeStylerFactory = new GraphNodeStylerFactory(),
  ) {
    super();
    this.sceneFactory = sceneFactory;
    this.hierarchyAnalyzer = hierarchyAnalyzer;
    this.connectorGeometry = connectorGeometry;
    this.nodeStylerFactory = nodeStylerFactory;
    this.reactiveMouseController = new ReactiveMouseController(this);
    this.interactionStateController = new GraphInteractionStateController(this);
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
    const scene = this.applyResponsiveNodeStyles(this.applyNodePositionOverrides(baseScene));
    const hierarchyByNodeId = this.createHierarchyByNodeId();
    this.currentScene = scene;

    return html`${this.sceneSvgRenderer.render(scene, {
      hierarchyByNodeId,
      highlightedNodeId: this.highlightedNodeId,
      highlightedEdgeId: this.highlightedEdgeId,
      connectionPointEdgeDraft: this.connectionPointEdgeDraft,
      createNodeColorStyle: (hierarchy) => this.createNodeColorStyle(hierarchy),
      getNodeSlotName: (nodeId) => this.getNodeSlotName(nodeId),
      getConnectionPointClass: (connectionPointId) => this.getConnectionPointClass(connectionPointId),
      onBoxClick: (boxId, event) => this.onBoxClick(boxId, event),
      onBoxRightClick: (boxId, event) => this.onBoxRightClick(boxId, event),
      onNodePointerDown: (nodeId, event) => this.onNodePointerDown(nodeId, event),
      onConnectionPointPointerDown: (boxId, connectionPointId, event) =>
        this.onConnectionPointPointerDown(boxId, connectionPointId, event),
      onConnectionPointPointerEnter: (connectionPointId) =>
        this.onConnectionPointPointerEnter(connectionPointId),
      onConnectionPointPointerLeave: (connectionPointId) =>
        this.onConnectionPointPointerLeave(connectionPointId),
      onConnectionPointClick: (boxId, connectionPointId, event) =>
        this.onConnectionPointClick(boxId, connectionPointId, event),
      onConnectionPointRightClick: (boxId, connectionPointId, event) =>
        this.onConnectionPointRightClick(boxId, connectionPointId, event),
      onEdgeClick: (edgeId, event) => this.onEdgeClick(edgeId, event),
    })}`;
  }

  override updated(changedProperties: PropertyValues<this>): void {
    super.updated(changedProperties);

    const svgElement = this.renderRoot.querySelector("svg");
    this.reactiveMouseController.setTarget(svgElement ?? window);

    if (changedProperties.has("controllers")) {
      this.controllerRegistry.addRange(this.controllers);
    }

    this.propagateNodeSlotProperties(this.currentScene);
  }

  private createSceneOptions(): GraphSceneOptions {
    return {
      width: this.width,
      height: this.height,
      padding: this.padding,
      boxWidth: this.boxWidth,
      boxHeight: this.boxHeight,
      nodeRepresentation: this.nodeRepresentation,
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

  private createHierarchyByNodeId(): Map<string, GraphNodeHierarchy> {
    return this.hierarchyAnalyzer.analyze(this.graph);
  }

  private applyResponsiveNodeStyles(scene: GraphSvgScene): GraphSvgScene {
    const hierarchyByNodeId = this.createHierarchyByNodeId();
    const autoScaleMetrics = this.createAutoScaleMetrics(scene, hierarchyByNodeId);

    const nodes = scene.nodes.map((node) => {
      const hierarchy = hierarchyByNodeId.get(node.id);
      const visual = this.createNodeVisualStyle(node, hierarchy, autoScaleMetrics);

      return {
        ...node,
        box: {
          topLeft: {
            x: visual.topLeftX,
            y: visual.topLeftY,
          },
          width: visual.width,
          height: visual.height,
        },
        connectionPoints: node.connectionPoints.map((connectionPoint) => ({
          ...connectionPoint,
          connector: this.createConnectionPointConnector(
            node.center,
            visual.width,
            visual.height,
            connectionPoint.role,
            node.circle?.radius,
            connectionPoint.angleDegrees,
          ),
        })),
      };
    });

    const nodeLookup = new Map(nodes.map((node) => [node.id, node]));

    const edges = scene.edges.map((edge) => {
      const source = nodeLookup.get(edge.start.nodeId);
      const target = nodeLookup.get(edge.end.nodeId);

      if (source === undefined || target === undefined) {
        return edge;
      }

      const startConnector = this.createEdgeConnector(source, target);
      const endConnector = this.createEdgeConnector(target, source);

      return {
        ...edge,
        start: {
          ...edge.start,
          connector: startConnector,
        },
        end: {
          ...edge.end,
          connector: endConnector,
        },
        edge: {
          ...edge.edge,
          path: this.createStraightPath(startConnector, endConnector),
        },
      };
    });

    return {
      ...scene,
      nodes,
      edges,
    };
  }

  private createEdgeConnector(
    from: GraphSvgScene["nodes"][number],
    to: GraphSvgScene["nodes"][number],
  ): GraphSvgConnector {
    return this.connectorGeometry.createEdgeConnector(from, to);
  }

  private createStraightPath(from: GraphSvgConnector, to: GraphSvgConnector): string {
    return this.connectorGeometry.createStraightPath(from, to);
  }

  private createConnectionPointConnector(
    center: GraphSvgConnector,
    width: number,
    height: number,
    role: string,
    circleRadius?: number,
    angleDegrees?: number,
  ): GraphSvgConnector {
    return this.connectorGeometry.createConnectionPointConnector(
      center,
      width,
      height,
      role,
      circleRadius,
      angleDegrees,
    );
  }

  private createNodeVisualStyle(
    node: GraphSvgScene["nodes"][number],
    hierarchy: GraphNodeHierarchy | undefined,
    autoScaleMetrics: GraphAutoScaleMetrics,
  ): GraphNodeVisualStyle {
    return this.createNodeStyler().createNodeVisualStyle(node, hierarchy, autoScaleMetrics);
  }

  private createNodeColorStyle(
    hierarchy: GraphNodeHierarchy | undefined,
  ): Pick<GraphNodeVisualStyle, "fill" | "stroke" | "text"> {
    return this.createNodeStyler().createNodeColorStyle(hierarchy);
  }

  private createAutoScaleMetrics(
    scene: GraphSvgScene,
    hierarchyByNodeId: ReadonlyMap<string, GraphNodeHierarchy>,
  ): GraphAutoScaleMetrics {
    return this.createNodeStyler().createAutoScaleMetrics(scene, hierarchyByNodeId);
  }

  private createNodeStyler(): IGraphNodeStyler {
    return this.nodeStylerFactory.create(this.boxWidth, this.boxHeight);
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
      this.nodePositionOverrides.set(nodeId, center);
      return;
    }

    this.nodePositionOverrides.set(
      nodeId,
      this.clampNodeCenterWithinBoundary(node, center, this.currentScene.boundary),
    );
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

  subscribePointerMove(listener: (event: PointerEvent) => void): () => void {
    return this.reactiveMouseController.subscribePointerMove(listener);
  }

  subscribePointerUp(listener: (event: PointerEvent) => void): () => void {
    return this.reactiveMouseController.subscribePointerUp(listener);
  }

  tryAcquireDragOwner(ownerId: string): boolean {
    return this.interactionStateController.tryAcquireDrag(ownerId);
  }

  releaseDragOwner(ownerId: string): void {
    this.interactionStateController.releaseDrag(ownerId);
  }

  notifyBoxClick(detail: GraphBoxClickDetail): void {
    this.dispatchEvent(new CustomEvent(GRAPH_EVENT_NAMES.boxClick, {
      bubbles: true,
      composed: true,
      detail,
    }));

    this.controllers.forEach((controller) => {
      controller.onBoxClick?.(detail);
    });
  }

  notifyBoxRightClick(detail: GraphBoxRightClickDetail): void {
    this.dispatchEvent(new CustomEvent(GRAPH_EVENT_NAMES.boxRightClick, {
      bubbles: true,
      composed: true,
      detail,
    }));

    this.controllers.forEach((controller) => {
      controller.onBoxRightClick?.(detail);
    });
  }

  notifyConnectionPointClick(detail: GraphConnectionPointClickDetail): void {
    this.dispatchEvent(new CustomEvent(GRAPH_EVENT_NAMES.connectionPointClick, {
      bubbles: true,
      composed: true,
      detail,
    }));

    this.controllers.forEach((controller) => {
      controller.onConnectionPointClick?.(detail);
    });
  }

  notifyConnectionPointRightClick(detail: GraphConnectionPointRightClickDetail): void {
    this.dispatchEvent(new CustomEvent(GRAPH_EVENT_NAMES.connectionPointRightClick, {
      bubbles: true,
      composed: true,
      detail,
    }));

    this.controllers.forEach((controller) => {
      controller.onConnectionPointRightClick?.(detail);
    });
  }

  notifyConnectionPointConnect(detail: GraphConnectionPointConnectDetail): void {
    this.dispatchEvent(new CustomEvent(GRAPH_EVENT_NAMES.connectionPointConnect, {
      bubbles: true,
      composed: true,
      detail,
    }));

    this.controllers.forEach((controller) => {
      controller.onConnectionPointConnect?.(detail);
    });
  }

  notifyEdgeClick(detail: GraphEdgeClickDetail): void {
    this.dispatchEvent(new CustomEvent(GRAPH_EVENT_NAMES.edgeClick, {
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

      const clampedCenter = this.clampNodeCenterWithinBoundary(node, overrideCenter, scene.boundary);

      return {
        ...node,
        center: clampedCenter,
        box: {
          ...node.box,
          topLeft: {
            x: clampedCenter.x - (node.box.width / 2),
            y: clampedCenter.y - (node.box.height / 2),
          },
        },
        connectionPoints: node.connectionPoints.map((connectionPoint) => ({
          ...connectionPoint,
          connector: this.repositionConnectionPoint(
            node,
            clampedCenter,
            connectionPoint.role,
            connectionPoint.angleDegrees,
          ),
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

  private clampNodeCenterWithinBoundary(
    node: GraphSvgScene["nodes"][number],
    center: GraphSvgConnector,
    boundary: GraphSvgScene["boundary"],
  ): GraphSvgConnector {
    const halfWidth = node.box.width / 2;
    const halfHeight = node.box.height / 2;
    const minimumX = boundary.topLeft.x + halfWidth;
    const maximumX = boundary.topLeft.x + boundary.width - halfWidth;
    const minimumY = boundary.topLeft.y + halfHeight;
    const maximumY = boundary.topLeft.y + boundary.height - halfHeight;

    return {
      x: Math.min(Math.max(center.x, minimumX), maximumX),
      y: Math.min(Math.max(center.y, minimumY), maximumY),
    };
  }

  private createNodeConnector(
    from: GraphSvgScene["nodes"][number],
    to: GraphSvgScene["nodes"][number],
  ): GraphSvgConnector {
    return this.connectorGeometry.createEdgeConnector(from, to);
  }

  private repositionConnectionPoint(
    node: GraphSvgScene["nodes"][number],
    center: GraphSvgConnector,
    role: GraphSvgScene["nodes"][number]["connectionPoints"][number]["role"],
    angleDegrees?: number,
  ): GraphSvgConnector {
    return this.connectorGeometry.repositionConnectionPoint(node, center, role, angleDegrees);
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
