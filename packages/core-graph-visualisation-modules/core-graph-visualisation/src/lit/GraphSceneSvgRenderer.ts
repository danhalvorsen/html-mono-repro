import { svg, type TemplateResult } from "lit";

import type { GraphConnectionPointEdgeDraft } from "../GraphElementControllers.js";
import type { GraphSvgScene } from "../GraphSvgScene.js";
import type { GraphNodeHierarchy, GraphNodeVisualStyle } from "./types.js";

const EDGE_ARROW_SHAPE = [
  { x: 0, y: 0 },
  { x: -1, y: 0.5 },
  { x: -1, y: -0.5 },
] as const;
const EDGE_ARROW_LENGTH = 14;
const EDGE_ARROW_WIDTH = 10;

export interface GraphSceneSvgRendererOptions {
  readonly hierarchyByNodeId: ReadonlyMap<string, GraphNodeHierarchy>;
  readonly highlightedNodeId: string | undefined;
  readonly highlightedEdgeId: string | undefined;
  readonly connectionPointEdgeDraft: GraphConnectionPointEdgeDraft | undefined;
  readonly createNodeColorStyle: (hierarchy: GraphNodeHierarchy | undefined) => Pick<GraphNodeVisualStyle, "fill" | "stroke" | "text">;
  readonly getNodeSlotName: (nodeId: string) => string;
  readonly getConnectionPointClass: (connectionPointId: string) => string;
  readonly onBoxClick: (boxId: string, event: MouseEvent) => void;
  readonly onBoxRightClick: (boxId: string, event: MouseEvent) => void;
  readonly onNodePointerDown: (nodeId: string, event: PointerEvent) => void;
  readonly onConnectionPointPointerDown: (boxId: string, connectionPointId: string, event: PointerEvent) => void;
  readonly onConnectionPointPointerEnter: (connectionPointId: string) => void;
  readonly onConnectionPointPointerLeave: (connectionPointId: string) => void;
  readonly onConnectionPointClick: (boxId: string, connectionPointId: string, event: MouseEvent) => void;
  readonly onConnectionPointRightClick: (boxId: string, connectionPointId: string, event: MouseEvent) => void;
  readonly onEdgeClick: (edgeId: string, event: MouseEvent) => void;
}

export class GraphSceneSvgRenderer {
  render(scene: GraphSvgScene, options: GraphSceneSvgRendererOptions): TemplateResult {
    const normalEdges = scene.edges.filter((edge) => edge.id !== options.highlightedEdgeId);
    const highlightedEdge = scene.edges.find((edge) => edge.id === options.highlightedEdgeId);
    const draftEdgePath = options.connectionPointEdgeDraft === undefined
      ? undefined
      : `M ${options.connectionPointEdgeDraft.sourceConnector.x} ${options.connectionPointEdgeDraft.sourceConnector.y} L ${options.connectionPointEdgeDraft.currentConnector.x} ${options.connectionPointEdgeDraft.currentConnector.y}`;
    const draftEdgeArrowPoints = options.connectionPointEdgeDraft === undefined
      ? undefined
      : this.createArrowPoints(
        options.connectionPointEdgeDraft.sourceConnector,
        options.connectionPointEdgeDraft.currentConnector,
      );

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
        ${normalEdges.map((edge) => this.renderEdge(edge, false, options))}
        ${scene.nodes.map((node) => {
          const hierarchy = options.hierarchyByNodeId.get(node.id);
          const visual = options.createNodeColorStyle(hierarchy);
          const isHighlighted = node.id === options.highlightedNodeId;

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
                  @click=${(event: MouseEvent) => options.onBoxClick(node.id, event)}
                  @contextmenu=${(event: MouseEvent) => options.onBoxRightClick(node.id, event)}
                  @pointerdown=${(event: PointerEvent) => options.onNodePointerDown(node.id, event)}
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
                  @click=${(event: MouseEvent) => options.onBoxClick(node.id, event)}
                  @contextmenu=${(event: MouseEvent) => options.onBoxRightClick(node.id, event)}
                  @pointerdown=${(event: PointerEvent) => options.onNodePointerDown(node.id, event)}
                ></rect>
              `}
            <foreignObject
              x=${node.box.topLeft.x}
              y=${node.box.topLeft.y}
              width=${node.box.width}
              height=${node.box.height}
              @click=${(event: MouseEvent) => options.onBoxClick(node.id, event)}
              @contextmenu=${(event: MouseEvent) => options.onBoxRightClick(node.id, event)}
              @pointerdown=${(event: PointerEvent) => options.onNodePointerDown(node.id, event)}
            >
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                class="node-slot-shell"
                style=${`--node-label-color: ${visual.text};`}
              >
                <slot
                  name=${options.getNodeSlotName(node.id)}
                  data-node-slot=${node.id}
                >
                  <span class="node-slot-label">${node.label}</span>
                </slot>
              </div>
            </foreignObject>
            ${node.id === options.highlightedNodeId || options.connectionPointEdgeDraft !== undefined
              ? node.connectionPoints.map((connectionPoint) => svg`
                <circle
                  class=${options.getConnectionPointClass(connectionPoint.id)}
                  cx=${connectionPoint.connector.x}
                  cy=${connectionPoint.connector.y}
                  r="6"
                  @pointerdown=${(event: PointerEvent) =>
                    options.onConnectionPointPointerDown(node.id, connectionPoint.id, event)}
                  @pointerenter=${() =>
                    options.onConnectionPointPointerEnter(connectionPoint.id)}
                  @pointerleave=${() =>
                    options.onConnectionPointPointerLeave(connectionPoint.id)}
                  @click=${(event: MouseEvent) =>
                    options.onConnectionPointClick(node.id, connectionPoint.id, event)}
                  @contextmenu=${(event: MouseEvent) =>
                    options.onConnectionPointRightClick(node.id, connectionPoint.id, event)}
                ></circle>
              `)
              : null}
          </g>
        `;
        })}
        ${highlightedEdge === undefined ? null : this.renderEdge(highlightedEdge, true, options)}
        ${draftEdgePath === undefined ? null : svg`
          <path class="edge edge--draft" d=${draftEdgePath}></path>
        `}
        ${draftEdgeArrowPoints === undefined ? null : svg`
          <polygon class="edge-arrow edge-arrow--draft" points=${draftEdgeArrowPoints}></polygon>
        `}
      </svg>
    `;
  }

  private renderEdge(
    edge: GraphSvgScene["edges"][number],
    highlighted: boolean,
    options: GraphSceneSvgRendererOptions,
  ): TemplateResult {
    const edgeArrowPoints = this.createEdgeArrowPoints(edge);

    return svg`
      <g data-edge-id=${edge.id}>
        <path
          class=${highlighted ? "edge edge--highlighted" : "edge"}
          d=${edge.edge.path}
          @click=${(event: MouseEvent) => options.onEdgeClick(edge.id, event)}
        ></path>
        ${edgeArrowPoints === undefined
          ? null
          : svg`
            <polygon
              class=${highlighted ? "edge-arrow edge-arrow--highlighted" : "edge-arrow"}
              points=${edgeArrowPoints}
            ></polygon>
          `}
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

  private createEdgeArrowPoints(edge: GraphSvgScene["edges"][number]): string | undefined {
    return this.createArrowPoints(edge.start.connector, edge.end.connector);
  }

  private createArrowPoints(from: GraphSvgScene["edges"][number]["start"]["connector"], to: GraphSvgScene["edges"][number]["end"]["connector"]): string | undefined {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy);

    if (length === 0) {
      return undefined;
    }

    const ux = dx / length;
    const uy = dy / length;
    const px = -uy;
    const py = ux;

    return EDGE_ARROW_SHAPE
      .map((point) => {
        const x = to.x + (point.x * EDGE_ARROW_LENGTH * ux) + (point.y * EDGE_ARROW_WIDTH * px);
        const y = to.y + (point.x * EDGE_ARROW_LENGTH * uy) + (point.y * EDGE_ARROW_WIDTH * py);
        return `${x},${y}`;
      })
      .join(" ");
  }
}
