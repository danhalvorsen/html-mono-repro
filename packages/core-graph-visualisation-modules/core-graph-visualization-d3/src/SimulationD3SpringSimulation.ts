import {
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
  type Simulation,
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

export interface D3SpringSimulationOptions {
  readonly chargeStrength: number;
  readonly linkDistance: number;
  readonly alphaDecay: number;
  readonly velocityDecay: number;
  readonly settleTicks: number;
}

const DEFAULT_OPTIONS: D3SpringSimulationOptions = {
  chargeStrength: -120,
  linkDistance: 80,
  alphaDecay: 0.0228,
  velocityDecay: 0.4,
  settleTicks: 0,
};

export interface ID3SpringSimulationHandle {
  readonly edgeConstraints: readonly GraphEdgeRouteConstraint[];
  getCurrentLayout(): GraphLayoutModel;
  tick(iterations?: number): GraphLayoutModel;
  start(): void;
  stop(): void;
  onTick(listener: (layout: GraphLayoutModel) => void): () => void;
  dispose(): void;
}

export class SimulationD3SpringSimulation implements IGraphLayoutStrategy {
  readonly name = "SimulationD3SpringSimulation";

  constructor(private readonly options: D3SpringSimulationOptions = DEFAULT_OPTIONS) {}

  supports(_request: GraphLayoutRequest): boolean {
    return true;
  }

  createLayout(request: GraphLayoutRequest): GraphLayoutModel {
    const session = this.createSimulation(request);
    const result = session.tick(Math.max(0, this.options.settleTicks));
    session.dispose();
    return result;
  }

  createSimulation(request: GraphLayoutRequest): ID3SpringSimulationHandle {
    const { graph, canvas, box } = request;

    if (graph.nodes.length === 0) {
      return this.createEmptyHandle(canvas, box);
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
      .alphaDecay(this.options.alphaDecay)
      .velocityDecay(this.options.velocityDecay)
      .stop();

    const edgeConstraints: readonly GraphEdgeRouteConstraint[] = d3Links.map((link) => ({
      sourceNodeId: link.sourceNodeId,
      targetNodeId: link.targetNodeId,
    }));
    const listeners = new Set<(layout: GraphLayoutModel) => void>();

    const buildModel = (): GraphLayoutModel => {
      const rawPositions = d3Nodes.map((node) => ({
        id: node.nodeId,
        payload: node.payload,
        x: node.x ?? 0,
        y: node.y ?? 0,
      }));

      return {
        canvas,
        box,
        nodeAnchors: this.scaleToCanvas(rawPositions, canvas, box),
        edgeConstraints,
      };
    };

    const notifyTick = (): GraphLayoutModel => {
      const model = buildModel();
      listeners.forEach((listener) => listener(model));
      return model;
    };

    simulation.on("tick", () => {
      notifyTick();
    });

    return {
      edgeConstraints,
      getCurrentLayout: () => buildModel(),
      tick: (iterations = 1) => {
        const safeIterations = Math.max(0, iterations);

        for (let i = 0; i < safeIterations; i += 1) {
          simulation.tick();
        }

        return notifyTick();
      },
      start: () => {
        simulation.restart();
      },
      stop: () => {
        simulation.stop();
      },
      onTick: (listener) => {
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
        };
      },
      dispose: () => {
        simulation.stop();
        simulation.on("tick", null);
        listeners.clear();
      },
    };
  }

  private createEmptyHandle(
    canvas: GraphCanvasConstraints,
    box: BoxConstraints,
  ): ID3SpringSimulationHandle {
    const model: GraphLayoutModel = {
      canvas,
      box,
      nodeAnchors: [],
      edgeConstraints: [],
    };

    return {
      edgeConstraints: model.edgeConstraints,
      getCurrentLayout: () => model,
      tick: () => model,
      start: () => {},
      stop: () => {},
      onTick: () => () => {},
      dispose: () => {},
    };
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
}
