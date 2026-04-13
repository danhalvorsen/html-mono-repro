import type {
  BoxConstraints,
  GraphCanvasConstraints,
  GraphLayoutModel,
  GraphLayoutRequest,
  GraphNodeAnchor,
  IGraphLayoutStrategy,
} from "@monorepo/core-graph-visualisation/layout";

import { createDirectEdgeRoutingConstraints } from "./DGMLEdgeRouting.js";
import type { DGMLLayerDirection, DGMLLayeredLayoutOptions } from "./DGMLLayoutTypes.js";

const DEFAULT_OPTIONS: Required<Omit<DGMLLayeredLayoutOptions, "kind">> = {
  maxNodesPerLayer: 12,
  layerSpacing: 1,
  nodeSpacing: 1,
  direction: "top-to-bottom",
  clusterByWeaklyConnectedComponents: false,
  clusterGap: 64,
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

    const resolvedOptions = { ...DEFAULT_OPTIONS, ...this.options };
    const components = resolvedOptions.clusterByWeaklyConnectedComponents
      ? this.createWeaklyConnectedComponents(request)
      : [graph.nodes.map((node) => node.id).sort((a, b) => a.localeCompare(b))];
    const componentLayers = components.map((componentNodeIds) => this.createLayers(request, componentNodeIds));
    const nodeAnchors = this.createAnchors(componentLayers, canvas, box, resolvedOptions);

    return {
      canvas,
      box,
      nodeAnchors,
      edgeConstraints: createDirectEdgeRoutingConstraints(request),
    };
  }

  private createLayers(
    request: GraphLayoutRequest,
    nodeIds: readonly string[],
  ): readonly (readonly string[])[] {
    const graph = request.graph;
    const options = { ...DEFAULT_OPTIONS, ...this.options };
    const included = new Set(nodeIds);
    const inDegree = new Map<string, number>();
    const outgoing = new Map<string, string[]>();

    nodeIds.forEach((nodeId) => {
      inDegree.set(nodeId, 0);
      outgoing.set(nodeId, []);
    });

    graph.edges.forEach((edge) => {
      if (!included.has(edge.source.id) || !included.has(edge.target.id)) {
        return;
      }

      outgoing.get(edge.source.id)?.push(edge.target.id);
      inDegree.set(edge.target.id, (inDegree.get(edge.target.id) ?? 0) + 1);
    });

    const ready = nodeIds
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

    nodeIds.forEach((nodeId) => {
      if (!levelByNode.has(nodeId)) {
        levelByNode.set(nodeId, 0);
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
    componentLayers: readonly (readonly (readonly string[])[])[],
    canvas: GraphCanvasConstraints,
    box: BoxConstraints,
    options: Required<Omit<DGMLLayeredLayoutOptions, "kind">>,
  ): readonly GraphNodeAnchor[] {
    const xMin = -((canvas.width / 2) - canvas.padding - (box.width / 2));
    const xMax = (canvas.width / 2) - canvas.padding - (box.width / 2);
    const yMin = -((canvas.height / 2) - canvas.padding - (box.height / 2));
    const yMax = (canvas.height / 2) - canvas.padding - (box.height / 2);
    const clusterCount = Math.max(1, componentLayers.length);
    const placeClustersHorizontally = options.direction === "top-to-bottom" || options.direction === "bottom-to-top";
    const clusterRanges = placeClustersHorizontally
      ? this.createRanges(xMin, xMax, clusterCount, options.clusterGap)
      : this.createRanges(yMin, yMax, clusterCount, options.clusterGap);

    return componentLayers.flatMap((layers, componentIndex) => {
      const xRange = placeClustersHorizontally
        ? clusterRanges[componentIndex] ?? { min: xMin, max: xMax }
        : { min: xMin, max: xMax };
      const yRange = placeClustersHorizontally
        ? { min: yMin, max: yMax }
        : clusterRanges[componentIndex] ?? { min: yMin, max: yMax };

      return this.createAnchorsForComponent(layers, xRange, yRange, options.direction, options, componentIndex);
    });
  }

  private createAnchorsForComponent(
    layers: readonly (readonly string[])[],
    xRange: { min: number; max: number },
    yRange: { min: number; max: number },
    direction: DGMLLayerDirection,
    options: Required<Omit<DGMLLayeredLayoutOptions, "kind">>,
    componentIndex: number,
  ): readonly GraphNodeAnchor[] {
    const totalLevels = Math.max(1, layers.length);

    return layers.flatMap((layer, layerIndex) => {
      const primary = totalLevels === 1 ? 0.5 : layerIndex / (totalLevels - 1);
      const slots = Math.max(1, layer.length);

      return layer.map((nodeId, index) => {
        const secondary = slots === 1 ? 0.5 : index / (slots - 1);
        const { x, y } = this.resolveCoordinates(primary, secondary, xRange, yRange, direction);

        return {
          id: nodeId,
          payload: {
            level: layerIndex,
            order: index,
            layerSpacing: options.layerSpacing,
            nodeSpacing: options.nodeSpacing,
            direction,
            componentIndex,
          },
          centerX: x,
          centerY: y,
        };
      });
    });
  }

  private resolveCoordinates(
    primary: number,
    secondary: number,
    xRange: { min: number; max: number },
    yRange: { min: number; max: number },
    direction: DGMLLayerDirection,
  ): { x: number; y: number } {
    switch (direction) {
      case "top-to-bottom":
        return {
          x: this.interpolate(xRange.min, xRange.max, secondary),
          y: this.interpolate(yRange.min, yRange.max, primary),
        };
      case "bottom-to-top":
        return {
          x: this.interpolate(xRange.min, xRange.max, secondary),
          y: this.interpolate(yRange.max, yRange.min, primary),
        };
      case "left-to-right":
        return {
          x: this.interpolate(xRange.min, xRange.max, primary),
          y: this.interpolate(yRange.min, yRange.max, secondary),
        };
      case "right-to-left":
        return {
          x: this.interpolate(xRange.max, xRange.min, primary),
          y: this.interpolate(yRange.min, yRange.max, secondary),
        };
    }
  }

  private interpolate(min: number, max: number, normalized: number): number {
    return min + ((max - min) * normalized);
  }

  private createRanges(min: number, max: number, count: number, requestedGap: number): readonly { min: number; max: number }[] {
    if (count <= 1) {
      return [{ min, max }];
    }

    const span = max - min;
    const safeGap = Math.max(0, Math.min(requestedGap, span / (count * 2)));
    const sliceSize = (span - (safeGap * (count - 1))) / count;

    return Array.from({ length: count }, (_, index) => {
      const start = min + (index * (sliceSize + safeGap));

      return {
        min: start,
        max: start + sliceSize,
      };
    });
  }

  private createWeaklyConnectedComponents(request: GraphLayoutRequest): readonly (readonly string[])[] {
    const graph = request.graph;
    const adjacency = new Map<string, Set<string>>();

    graph.nodes.forEach((node) => {
      adjacency.set(node.id, new Set<string>());
    });

    graph.edges.forEach((edge) => {
      adjacency.get(edge.source.id)?.add(edge.target.id);
      adjacency.get(edge.target.id)?.add(edge.source.id);
    });

    const pending = graph.nodes.map((node) => node.id).sort((a, b) => a.localeCompare(b));
    const visited = new Set<string>();
    const components: string[][] = [];

    pending.forEach((nodeId) => {
      if (visited.has(nodeId)) {
        return;
      }

      const queue = [nodeId];
      const component: string[] = [];
      visited.add(nodeId);

      while (queue.length > 0) {
        const current = queue.shift();

        if (current === undefined) {
          continue;
        }

        component.push(current);
        (adjacency.get(current) ?? new Set<string>()).forEach((neighbour) => {
          if (visited.has(neighbour)) {
            return;
          }

          visited.add(neighbour);
          queue.push(neighbour);
        });
      }

      components.push(component.sort((a, b) => a.localeCompare(b)));
    });

    return components;
  }
}
