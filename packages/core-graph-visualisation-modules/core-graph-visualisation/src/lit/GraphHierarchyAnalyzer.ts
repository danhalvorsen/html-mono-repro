import type { IGraph } from "@monorepo/core-graph";

import type { IGraphHierarchyAnalyzer } from "./contracts.js";
import type { GraphNodeHierarchy } from "./types.js";

export class GraphHierarchyAnalyzer implements IGraphHierarchyAnalyzer {
  analyze(graph: IGraph | undefined): Map<string, GraphNodeHierarchy> {
    const hierarchyByNodeId = new Map<string, GraphNodeHierarchy>();

    if (graph === undefined || graph.nodes.length === 0) {
      return hierarchyByNodeId;
    }

    const inDegree = new Map<string, number>();
    const outEdges = new Map<string, string[]>();
    const undirectedAdjacency = new Map<string, Set<string>>();

    graph.nodes.forEach((node) => {
      inDegree.set(node.id, 0);
      outEdges.set(node.id, []);
      undirectedAdjacency.set(node.id, new Set<string>());
    });

    graph.edges.forEach((edge) => {
      const sourceId = edge.source.id;
      const targetId = edge.target.id;
      outEdges.get(sourceId)?.push(targetId);
      inDegree.set(targetId, (inDegree.get(targetId) ?? 0) + 1);
      undirectedAdjacency.get(sourceId)?.add(targetId);
      undirectedAdjacency.get(targetId)?.add(sourceId);
    });

    const subgraphByNodeId = new Map<string, number>();
    let nextSubgraphIndex = 0;
    const sortedNodeIds = graph.nodes.map((node) => node.id).sort((left, right) => left.localeCompare(right));

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

    const roots = graph.nodes
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

    graph.nodes.forEach((node) => {
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
}
