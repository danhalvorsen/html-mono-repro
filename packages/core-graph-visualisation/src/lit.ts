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
  type GraphNodeVisualRepresentation,
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

interface GraphNodeHierarchy {
  readonly level: number;
  readonly subLevel: number;
  readonly levelSize: number;
  readonly maxLevel: number;
  readonly subgraphIndex: number;
}

interface GraphNodeVisualStyle {
  readonly fill: string;
  readonly stroke: string;
  readonly text: string;
  readonly width: number;
  readonly height: number;
  readonly topLeftX: number;
  readonly topLeftY: number;
}

interface GraphAutoScaleMetrics {
  readonly nodeScale: number;
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
    const scene = this.applyResponsiveNodeStyles(this.applyNodePositionOverrides(baseScene));
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
    const hierarchyByNodeId = this.createHierarchyByNodeId();
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
        ${scene.nodes.map((node) => {
          const hierarchy = hierarchyByNodeId.get(node.id);
          const visual = this.createNodeColorStyle(hierarchy);
          const isHighlighted = node.id === this.highlightedNodeId;

          return svg`
          <g>
            ${node.representation === "circle" && node.circle !== undefined
              ? svg`
                <circle
                  class=${isHighlighted ? "node node--highlighted" : "node"}
                  style=${isHighlighted ? "" : `fill: ${visual.fill}; stroke: ${visual.stroke};`}
                  cx=${node.center.x}
                  cy=${node.center.y}
                  r=${node.circle.radius}
                  @click=${(event: MouseEvent) => this.onBoxClick(node.id, event)}
                  @contextmenu=${(event: MouseEvent) => this.onBoxRightClick(node.id, event)}
                  @pointerdown=${(event: PointerEvent) => this.onNodePointerDown(node.id, event)}
                ></circle>
              `
              : svg`
                <rect
                  class=${isHighlighted ? "node node--highlighted" : "node"}
                  style=${isHighlighted ? "" : `fill: ${visual.fill}; stroke: ${visual.stroke};`}
                  x=${node.box.topLeft.x}
                  y=${node.box.topLeft.y}
                  width=${node.box.width}
                  height=${node.box.height}
                  @click=${(event: MouseEvent) => this.onBoxClick(node.id, event)}
                  @contextmenu=${(event: MouseEvent) => this.onBoxRightClick(node.id, event)}
                  @pointerdown=${(event: PointerEvent) => this.onNodePointerDown(node.id, event)}
                ></rect>
              `}
            <foreignObject
              x=${node.box.topLeft.x}
              y=${node.box.topLeft.y}
              width=${node.box.width}
              height=${node.box.height}
              @click=${(event: MouseEvent) => this.onBoxClick(node.id, event)}
              @contextmenu=${(event: MouseEvent) => this.onBoxRightClick(node.id, event)}
              @pointerdown=${(event: PointerEvent) => this.onNodePointerDown(node.id, event)}
            >
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                class="node-slot-shell"
                style=${`--node-label-color: ${visual.text};`}
              >
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
        `;
        })}
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
    const hierarchyByNodeId = new Map<string, GraphNodeHierarchy>();

    if (this.graph === undefined || this.graph.nodes.length === 0) {
      return hierarchyByNodeId;
    }

    const inDegree = new Map<string, number>();
    const outEdges = new Map<string, string[]>();
    const undirectedAdjacency = new Map<string, Set<string>>();

    this.graph.nodes.forEach((node) => {
      inDegree.set(node.id, 0);
      outEdges.set(node.id, []);
      undirectedAdjacency.set(node.id, new Set<string>());
    });

    this.graph.edges.forEach((edge) => {
      const sourceId = edge.source.id;
      const targetId = edge.target.id;
      outEdges.get(sourceId)?.push(targetId);
      inDegree.set(targetId, (inDegree.get(targetId) ?? 0) + 1);
      undirectedAdjacency.get(sourceId)?.add(targetId);
      undirectedAdjacency.get(targetId)?.add(sourceId);
    });

    const subgraphByNodeId = new Map<string, number>();
    let nextSubgraphIndex = 0;
    const sortedNodeIds = this.graph.nodes.map((node) => node.id).sort((left, right) => left.localeCompare(right));

    sortedNodeIds.forEach((startId) => {
      if (subgraphByNodeId.has(startId)) {
        return;
      }

      const stack = [startId];
      subgraphByNodeId.set(startId, nextSubgraphIndex);

      while (stack.length > 0) {
        const current = stack.pop();

        if (current === undefined) {
          continue;
        }

        (undirectedAdjacency.get(current) ?? []).forEach((adjacent) => {
          if (subgraphByNodeId.has(adjacent)) {
            return;
          }

          subgraphByNodeId.set(adjacent, nextSubgraphIndex);
          stack.push(adjacent);
        });
      }

      nextSubgraphIndex += 1;
    });

    const roots = this.graph.nodes
      .map((node) => node.id)
      .filter((id) => (inDegree.get(id) ?? 0) === 0)
      .sort((left, right) => left.localeCompare(right));
    const queue = [...roots];
    const levelByNodeId = new Map<string, number>();

    roots.forEach((rootId) => {
      levelByNodeId.set(rootId, 0);
    });

    while (queue.length > 0) {
      const current = queue.shift();

      if (current === undefined) {
        continue;
      }

      const currentLevel = levelByNodeId.get(current) ?? 0;

      (outEdges.get(current) ?? []).forEach((targetId) => {
        const nextLevel = Math.max(levelByNodeId.get(targetId) ?? 0, currentLevel + 1);
        levelByNodeId.set(targetId, nextLevel);

        const remaining = (inDegree.get(targetId) ?? 0) - 1;
        inDegree.set(targetId, remaining);

        if (remaining === 0) {
          queue.push(targetId);
        }
      });
    }

    this.graph.nodes.forEach((node) => {
      if (!levelByNodeId.has(node.id)) {
        levelByNodeId.set(node.id, 0);
      }
    });

    const nodesByLevel = new Map<number, string[]>();
    levelByNodeId.forEach((level, nodeId) => {
      const nodes = nodesByLevel.get(level) ?? [];
      nodes.push(nodeId);
      nodesByLevel.set(level, nodes);
    });

    nodesByLevel.forEach((nodes) => {
      nodes.sort((left, right) => left.localeCompare(right));
    });

    const maxLevel = Math.max(...Array.from(levelByNodeId.values()));

    levelByNodeId.forEach((level, nodeId) => {
      const nodes = nodesByLevel.get(level) ?? [nodeId];
      hierarchyByNodeId.set(nodeId, {
        level,
        subLevel: nodes.indexOf(nodeId),
        levelSize: nodes.length,
        maxLevel,
        subgraphIndex: subgraphByNodeId.get(nodeId) ?? 0,
      });
    });

    return hierarchyByNodeId;
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
    const snappedConnector = this.findNearestConnectionPointConnector(from, to);

    if (snappedConnector !== undefined) {
      return snappedConnector;
    }

    const deltaX = to.center.x - from.center.x;
    const deltaY = to.center.y - from.center.y;

    if (from.representation === "circle" && from.circle !== undefined) {
      const angle = Math.atan2(deltaY, deltaX);

      return {
        x: from.center.x + (Math.cos(angle) * from.circle.radius),
        y: from.center.y + (Math.sin(angle) * from.circle.radius),
      };
    }

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

  private findNearestConnectionPointConnector(
    from: GraphSvgScene["nodes"][number],
    to: GraphSvgScene["nodes"][number],
  ): GraphSvgConnector | undefined {
    if (from.connectionPoints.length === 0) {
      return undefined;
    }

    let nearest = from.connectionPoints[0]?.connector;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const connectionPoint of from.connectionPoints) {
      const deltaX = to.center.x - connectionPoint.connector.x;
      const deltaY = to.center.y - connectionPoint.connector.y;
      const distanceSquared = (deltaX * deltaX) + (deltaY * deltaY);

      if (distanceSquared < nearestDistance) {
        nearestDistance = distanceSquared;
        nearest = connectionPoint.connector;
      }
    }

    return nearest;
  }

  private createStraightPath(from: GraphSvgConnector, to: GraphSvgConnector): string {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }

  private createConnectionPointConnector(
    center: GraphSvgConnector,
    width: number,
    height: number,
    role: string,
    circleRadius?: number,
    angleDegrees?: number,
  ): GraphSvgConnector {
    if (circleRadius !== undefined) {
      const radians = ((angleDegrees ?? this.getDefaultAngleForRole(role)) * Math.PI) / 180;

      return {
        x: center.x + (Math.cos(radians) * circleRadius),
        y: center.y + (Math.sin(radians) * circleRadius),
      };
    }

    const halfWidth = width / 2;
    const halfHeight = height / 2;

    switch (role) {
      case "top":
        return { x: center.x, y: center.y - halfHeight };
      case "right":
        return { x: center.x + halfWidth, y: center.y };
      case "bottom":
        return { x: center.x, y: center.y + halfHeight };
      case "left":
        return { x: center.x - halfWidth, y: center.y };
      default:
        return center;
    }
  }

  private getDefaultAngleForRole(role: string): number {
    switch (role) {
      case "right":
        return 0;
      case "bottom":
        return 90;
      case "left":
        return 180;
      case "top":
        return 270;
      default:
        if (role.startsWith("angle-")) {
          return Number(role.slice("angle-".length)) || 0;
        }

        return 0;
    }
  }

  private createNodeVisualStyle(
    node: GraphSvgScene["nodes"][number],
    hierarchy: GraphNodeHierarchy | undefined,
    autoScaleMetrics: GraphAutoScaleMetrics,
  ): GraphNodeVisualStyle {
    const level = hierarchy?.level ?? 0;
    const maxLevel = hierarchy?.maxLevel ?? 0;
    const subLevel = hierarchy?.subLevel ?? 0;
    const levelSize = hierarchy?.levelSize ?? 1;
    const subgraphIndex = hierarchy?.subgraphIndex ?? 0;

    const depthRatio = maxLevel === 0 ? 0 : (level / maxLevel);
    const levelScale = Math.max(0.84, Math.min(1.12, 1.08 - (depthRatio * 0.22)));
    const sizeScale = levelScale * autoScaleMetrics.nodeScale;
    const width = node.box.width * sizeScale;
    const height = node.box.height * sizeScale;
    const topLeftX = node.center.x - (width / 2);
    const topLeftY = node.center.y - (height / 2);

    const hue = this.getPaletteHueForNode(level, subgraphIndex);
    const baseLightness = 31 + ((level % 3) * 3);
    const subLevelRatio = levelSize <= 1 ? 0 : (subLevel / (levelSize - 1));
    const shadeOffset = (subLevelRatio - 0.5) * 10;
    const fillLightness = Math.max(25, Math.min(47, baseLightness + shadeOffset));
    const strokeLightness = Math.max(18, fillLightness - 9);
    const textLightness = Math.min(98, fillLightness + 56);

    return {
      fill: `hsl(${hue} 52% ${fillLightness}%)`,
      stroke: `hsl(${hue} 56% ${strokeLightness}%)`,
      text: `hsl(${hue} 42% ${textLightness}%)`,
      width,
      height,
      topLeftX,
      topLeftY,
    };
  }

  private createNodeColorStyle(
    hierarchy: GraphNodeHierarchy | undefined,
  ): Pick<GraphNodeVisualStyle, "fill" | "stroke" | "text"> {
    const level = hierarchy?.level ?? 0;
    const subLevel = hierarchy?.subLevel ?? 0;
    const levelSize = hierarchy?.levelSize ?? 1;
    const subgraphIndex = hierarchy?.subgraphIndex ?? 0;
    const hue = this.getPaletteHueForNode(level, subgraphIndex);
    const baseLightness = 31 + ((level % 3) * 3);
    const subLevelRatio = levelSize <= 1 ? 0 : (subLevel / (levelSize - 1));
    const shadeOffset = (subLevelRatio - 0.5) * 10;
    const fillLightness = Math.max(25, Math.min(47, baseLightness + shadeOffset));
    const strokeLightness = Math.max(18, fillLightness - 9);
    const textLightness = Math.min(98, fillLightness + 56);

    return {
      fill: `hsl(${hue} 52% ${fillLightness}%)`,
      stroke: `hsl(${hue} 56% ${strokeLightness}%)`,
      text: `hsl(${hue} 42% ${textLightness}%)`,
    };
  }

  private getPaletteHueForNode(level: number, subgraphIndex: number): number {
    const subgraphPalettes: readonly (readonly number[])[] = [
      [148, 156, 164, 172, 180],
      [214, 206, 198, 190, 182],
      [28, 34, 40, 46, 52],
      [286, 278, 270, 262, 254],
      [346, 338, 330, 322, 314],
      [186, 178, 170, 162, 154],
    ];
    const defaultPalette: readonly number[] = [148, 156, 164, 172, 180];
    const palette = subgraphPalettes[subgraphIndex % subgraphPalettes.length] ?? defaultPalette;

    return palette[level % palette.length] ?? palette[0] ?? 148;
  }

  private createAutoScaleMetrics(
    scene: GraphSvgScene,
    hierarchyByNodeId: ReadonlyMap<string, GraphNodeHierarchy>,
  ): GraphAutoScaleMetrics {
    if (scene.nodes.length === 0) {
      return { nodeScale: 1 };
    }

    let maxLevel = 0;
    const levelNodeCounts = new Map<number, number>();

    hierarchyByNodeId.forEach((hierarchy) => {
      maxLevel = Math.max(maxLevel, hierarchy.level);
      levelNodeCounts.set(hierarchy.level, (levelNodeCounts.get(hierarchy.level) ?? 0) + 1);
    });

    const maxNodesInAnyLevel = Math.max(1, ...Array.from(levelNodeCounts.values()));
    const levelCount = Math.max(1, maxLevel + 1);
    const availableWidth = Math.max(1, scene.boundary.width - 28);
    const availableHeight = Math.max(1, scene.boundary.height - 28);
    const widthPerNode = availableWidth / (maxNodesInAnyLevel + 0.35);
    const heightPerLevel = availableHeight / (levelCount + 0.4);
    const widthScale = widthPerNode / this.boxWidth;
    const heightScale = heightPerLevel / this.boxHeight;

    const targetCoverage = 0.2;
    const densityScale = Math.sqrt(
      (availableWidth * availableHeight * targetCoverage)
        / Math.max(1, scene.nodes.length * this.boxWidth * this.boxHeight),
    );

    return {
      nodeScale: Math.max(0.52, Math.min(1.28, Math.min(widthScale, heightScale, densityScale))),
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
          connector: this.repositionConnectionPoint(
            node,
            overrideCenter,
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

  private createNodeConnector(
    from: GraphSvgScene["nodes"][number],
    to: GraphSvgScene["nodes"][number],
  ): GraphSvgConnector {
    const snappedConnector = this.findNearestConnectionPointConnector(from, to);

    if (snappedConnector !== undefined) {
      return snappedConnector;
    }

    const deltaX = to.center.x - from.center.x;
    const deltaY = to.center.y - from.center.y;

    if (from.representation === "circle" && from.circle !== undefined) {
      const angle = Math.atan2(deltaY, deltaX);

      return {
        x: from.center.x + (Math.cos(angle) * from.circle.radius),
        y: from.center.y + (Math.sin(angle) * from.circle.radius),
      };
    }

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
    angleDegrees?: number,
  ): GraphSvgConnector {
    if (node.representation === "circle" && node.circle !== undefined) {
      return this.createConnectionPointConnector(
        center,
        node.box.width,
        node.box.height,
        role,
        node.circle.radius,
        angleDegrees,
      );
    }

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
      default:
        return center;
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
