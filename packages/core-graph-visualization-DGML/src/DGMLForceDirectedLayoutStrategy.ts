import type {
  BoxConstraints,
  GraphCanvasConstraints,
  GraphLayoutModel,
  GraphLayoutRequest,
  GraphNodeAnchor,
  IGraphLayoutStrategy,
} from "@monorepo/core-graph-visualisation/layout";

import { createDirectEdgeRoutingConstraints } from "./DGMLEdgeRouting.js";
import type { DGMLForceDirectedLayoutOptions } from "./DGMLLayoutTypes.js";

const DEFAULT_OPTIONS: Required<Omit<DGMLForceDirectedLayoutOptions, "kind">> = {
  iterations: 180,
  repulsion: 1300,
  springLength: 120,
  damping: 0.82,
};

interface MutableNode {
  readonly id: string;
  readonly payload: unknown;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export class DGMLForceDirectedLayoutStrategy implements IGraphLayoutStrategy {
  readonly name = "DGMLForceDirectedLayout";

  constructor(private readonly options: Partial<Omit<DGMLForceDirectedLayoutOptions, "kind">> = {}) {}

  supports(_request: GraphLayoutRequest): boolean {
    return true;
  }

  createLayout(request: GraphLayoutRequest): GraphLayoutModel {
    const { graph, canvas, box } = request;

    if (graph.nodes.length === 0) {
      return {
        canvas,
        box,
        nodeAnchors: [],
        edgeConstraints: [],
      };
    }

    const options = { ...DEFAULT_OPTIONS, ...this.options };
    const nodes = this.createInitialNodes(request);

    for (let i = 0; i < options.iterations; i += 1) {
      this.applyRepulsion(nodes, options.repulsion);
      this.applySpringForces(nodes, request, options.springLength);
      this.integrate(nodes, options.damping);
    }

    const nodeAnchors = this.scaleToCanvas(nodes, canvas, box);

    return {
      canvas,
      box,
      nodeAnchors,
      edgeConstraints: createDirectEdgeRoutingConstraints(request),
    };
  }

  private createInitialNodes(request: GraphLayoutRequest): MutableNode[] {
    return request.graph.nodes.map((node, index) => {
      const angle = (Math.PI * 2 * index) / Math.max(1, request.graph.nodes.length);
      const radius = 80 + ((index % 5) * 16);

      return {
        id: node.id,
        payload: node.payload,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
      };
    });
  }

  private applyRepulsion(nodes: MutableNode[], repulsion: number): void {
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const left = nodes[i]!;
        const right = nodes[j]!;
        const dx = left.x - right.x;
        const dy = left.y - right.y;
        const distSquared = Math.max(4, (dx * dx) + (dy * dy));
        const force = repulsion / distSquared;
        const dist = Math.sqrt(distSquared);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        left.vx += fx;
        left.vy += fy;
        right.vx -= fx;
        right.vy -= fy;
      }
    }
  }

  private applySpringForces(
    nodes: MutableNode[],
    request: GraphLayoutRequest,
    springLength: number,
  ): void {
    const lookup = new Map(nodes.map((node) => [node.id, node]));

    request.graph.edges.forEach((edge) => {
      const source = lookup.get(edge.source.id);
      const target = lookup.get(edge.target.id);

      if (source === undefined || target === undefined) {
        return;
      }

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.max(1, Math.sqrt((dx * dx) + (dy * dy)));
      const stretch = dist - springLength;
      const force = stretch * 0.018;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      source.vx += fx;
      source.vy += fy;
      target.vx -= fx;
      target.vy -= fy;
    });
  }

  private integrate(nodes: MutableNode[], damping: number): void {
    nodes.forEach((node) => {
      node.vx *= damping;
      node.vy *= damping;
      node.x += node.vx;
      node.y += node.vy;
    });
  }

  private scaleToCanvas(
    nodes: readonly MutableNode[],
    canvas: GraphCanvasConstraints,
    box: BoxConstraints,
  ): readonly GraphNodeAnchor[] {
    const halfBoxWidth = box.width / 2;
    const halfBoxHeight = box.height / 2;
    const usableWidth = canvas.width - (canvas.padding * 2) - box.width;
    const usableHeight = canvas.height - (canvas.padding * 2) - box.height;

    const xs = nodes.map((p) => p.x);
    const ys = nodes.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const offsetX = canvas.padding + halfBoxWidth;
    const offsetY = canvas.padding + halfBoxHeight;

    return nodes.map((node) => {
      const normalX = (node.x - minX) / rangeX;
      const normalY = (node.y - minY) / rangeY;

      return {
        id: node.id,
        payload: node.payload,
        centerX: offsetX + (normalX * usableWidth) - (canvas.width / 2),
        centerY: offsetY + (normalY * usableHeight) - (canvas.height / 2),
      };
    });
  }
}
