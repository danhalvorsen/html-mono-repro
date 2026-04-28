import {
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";

import type {
  BoxConstraints,
  GraphCanvasConstraints,
  GraphNodeAnchor,
  IGraphLayoutStrategy,
} from "@monorepo/core-graph-visualisation";
import type {
  GraphEdgeRouteConstraint,
  GraphLayoutModel,
  GraphLayoutRequest,
} from "@monorepo/core-graph-visualisation/layout";

type GraphNode = GraphLayoutRequest["graph"]["nodes"][number];
type GraphEdge = GraphLayoutRequest["graph"]["edges"][number];

interface D3Node extends SimulationNodeDatum {
  readonly nodeId: string;
  readonly payload: unknown;
}

interface D3Link extends SimulationLinkDatum<D3Node> {
  readonly sourceNodeId: string;
  readonly targetNodeId: string;
}

export interface D3ForceLayoutOptions {
  /** Number of simulation ticks to run. Higher = more settled layout. Default: 300 */
  readonly ticks: number;
  /** Repulsion strength between nodes. Negative = repels. Default: -120 */
  readonly chargeStrength: number;
  /** Ideal distance between linked nodes. Default: 80 */
  readonly linkDistance: number;
}

const DEFAULT_OPTIONS: D3ForceLayoutOptions = {
  ticks: 300,
  chargeStrength: -120,
  linkDistance: 80,
};

export class D3ForceGraphLayoutStrategy implements IGraphLayoutStrategy {
  readonly name = "D3ForceGraphLayout";

  constructor(private readonly options: D3ForceLayoutOptions = DEFAULT_OPTIONS) {}

  supports(_request: GraphLayoutRequest): boolean {
    return true;
  }

  createLayout(request: GraphLayoutRequest): GraphLayoutModel {
    const { graph, canvas, box } = request;

    if (graph.nodes.length === 0) {
      return this.emptyLayout(canvas, box);
    }

    const d3Nodes: D3Node[] = graph.nodes.map((node: GraphNode) => ({
      nodeId: node.id,
      payload: node.payload,
    }));

    const nodeIndexById = new Map<string, number>(
      d3Nodes.map((node, index) => [node.nodeId, index]),
    );

    const d3Links: D3Link[] = graph.edges.map((edge: GraphEdge) => ({
      sourceNodeId: edge.source.id,
      targetNodeId: edge.target.id,
      source: nodeIndexById.get(edge.source.id) ?? 0,
      target: nodeIndexById.get(edge.target.id) ?? 0,
    }));

    const simulation = forceSimulation(d3Nodes)
      .force(
        "link",
        forceLink<D3Node, D3Link>(d3Links)
          .id((_node: D3Node, index: number) => index)
          .distance(this.options.linkDistance),
      )
      .force("charge", forceManyBody<D3Node>().strength(this.options.chargeStrength))
      .force("center", forceCenter(0, 0))
      .stop();

    simulation.tick(this.options.ticks);

    const rawPositions = d3Nodes.map((node) => ({
      id: node.nodeId,
      payload: node.payload,
      x: node.x ?? 0,
      y: node.y ?? 0,
    }));

    const nodeAnchors = this.scaleToCanvas(rawPositions, canvas, box);

    const edgeConstraints: readonly GraphEdgeRouteConstraint[] = d3Links.map((link) => ({
      sourceNodeId: link.sourceNodeId,
      targetNodeId: link.targetNodeId,
    }));

    return { canvas, box, nodeAnchors, edgeConstraints };
  }

  private scaleToCanvas(
    rawPositions: readonly { id: string; payload: unknown; x: number; y: number }[],
    canvas: GraphCanvasConstraints,
    box: BoxConstraints,
  ): readonly GraphNodeAnchor[] {
    const halfBoxWidth = box.width / 2;
    const halfBoxHeight = box.height / 2;
    const usableWidth = canvas.width - (canvas.padding * 2) - box.width;
    const usableHeight = canvas.height - (canvas.padding * 2) - box.height;

    const xs = rawPositions.map((p) => p.x);
    const ys = rawPositions.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;

    const offsetX = canvas.padding + halfBoxWidth;
    const offsetY = canvas.padding + halfBoxHeight;

    return rawPositions.map((pos) => {
      const normalX = (pos.x - minX) / rangeX;
      const normalY = (pos.y - minY) / rangeY;

      return {
        id: pos.id,
        payload: pos.payload,
        centerX: offsetX + normalX * usableWidth - canvas.width / 2,
        centerY: offsetY + normalY * usableHeight - canvas.height / 2,
      };
    });
  }

  private emptyLayout(
    canvas: GraphCanvasConstraints,
    box: BoxConstraints,
  ): GraphLayoutModel {
    return { canvas, box, nodeAnchors: [], edgeConstraints: [] };
  }
}
