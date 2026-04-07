import type {
  BoxConstraints,
  GraphCanvasConstraints,
  GraphLayoutModel,
  GraphLayoutRequest,
  GraphNodeAnchor,
  IGraphLayoutStrategy,
} from "@monorepo/core-graph-visualisation/layout";

import { createDirectEdgeRoutingConstraints } from "./DGMLEdgeRouting.js";
import type { DGMLLayeredLayoutOptions } from "./DGMLLayoutTypes.js";

const DEFAULT_OPTIONS: Required<Omit<DGMLLayeredLayoutOptions, "kind">> = {
  maxNodesPerLayer: 12,
  layerSpacing: 1,
  nodeSpacing: 1,
};

export class DGMLLayeredLayoutStrategy implements IGraphLayoutStrategy {
  readonly name = "DGMLLayeredLayout";

  constructor(private readonly options: Partial<Omit<DGMLLayeredLayoutOptions, "kind">> = {}) {}

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

    const layers = this.createLayers(request);
    const nodeAnchors = this.createAnchors(layers, canvas, box);

    return {
      canvas,
      box,
      nodeAnchors,
      edgeConstraints: createDirectEdgeRoutingConstraints(request),
    };
  }

  private createLayers(request: GraphLayoutRequest): readonly (readonly string[])[] {
    const graph = request.graph;
    const options = { ...DEFAULT_OPTIONS, ...this.options };
    const inDegree = new Map<string, number>();
    const outgoing = new Map<string, string[]>();

    graph.nodes.forEach((node) => {
      inDegree.set(node.id, 0);
      outgoing.set(node.id, []);
    });

    graph.edges.forEach((edge) => {
      outgoing.get(edge.source.id)?.push(edge.target.id);
      inDegree.set(edge.target.id, (inDegree.get(edge.target.id) ?? 0) + 1);
    });

    const ready = graph.nodes
      .map((node) => node.id)
      .filter((id) => (inDegree.get(id) ?? 0) === 0)
      .sort((a, b) => a.localeCompare(b));

    const levelByNode = new Map<string, number>();
    ready.forEach((id) => levelByNode.set(id, 0));

    const queue = [...ready];
    while (queue.length > 0) {
      const currentId = queue.shift();

      if (currentId === undefined) {
        continue;
      }

      const currentLevel = levelByNode.get(currentId) ?? 0;
      (outgoing.get(currentId) ?? []).forEach((targetId) => {
        levelByNode.set(targetId, Math.max(levelByNode.get(targetId) ?? 0, currentLevel + 1));
        const nextInDegree = (inDegree.get(targetId) ?? 0) - 1;
        inDegree.set(targetId, nextInDegree);

        if (nextInDegree === 0) {
          queue.push(targetId);
        }
      });
    }

    graph.nodes.forEach((node) => {
      if (!levelByNode.has(node.id)) {
        levelByNode.set(node.id, 0);
      }
    });

    const byLevel = new Map<number, string[]>();
    levelByNode.forEach((level, id) => {
      const current = byLevel.get(level) ?? [];
      current.push(id);
      byLevel.set(level, current);
    });

    const levels = Array.from(byLevel.keys()).sort((a, b) => a - b);
    const layers: string[][] = [];

    levels.forEach((level) => {
      const nodes = (byLevel.get(level) ?? []).sort((a, b) => a.localeCompare(b));

      for (let i = 0; i < nodes.length; i += options.maxNodesPerLayer) {
        layers.push(nodes.slice(i, i + options.maxNodesPerLayer));
      }
    });

    return layers;
  }

  private createAnchors(
    layers: readonly (readonly string[])[],
    canvas: GraphCanvasConstraints,
    box: BoxConstraints,
  ): readonly GraphNodeAnchor[] {
    const options = { ...DEFAULT_OPTIONS, ...this.options };
    const xMin = -((canvas.width / 2) - canvas.padding - (box.width / 2));
    const xMax = (canvas.width / 2) - canvas.padding - (box.width / 2);
    const yMin = -((canvas.height / 2) - canvas.padding - (box.height / 2));
    const yMax = (canvas.height / 2) - canvas.padding - (box.height / 2);
    const totalLevels = Math.max(1, layers.length);

    return layers.flatMap((layer, layerIndex) => {
      const normalizedY = totalLevels === 1 ? 0.5 : layerIndex / (totalLevels - 1);
      const y = yMax - (normalizedY * (yMax - yMin));
      const slots = Math.max(1, layer.length);

      return layer.map((nodeId, index) => {
        const normalizedX = slots === 1 ? 0.5 : index / (slots - 1);
        const x = xMin + (normalizedX * (xMax - xMin));

        return {
          id: nodeId,
          payload: {
            level: layerIndex,
            order: index,
            layerSpacing: options.layerSpacing,
            nodeSpacing: options.nodeSpacing,
          },
          centerX: x,
          centerY: y,
        };
      });
    });
  }
}
