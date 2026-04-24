import { expect } from "vitest";

export interface GraphJsonNode {
  readonly id: string;
  readonly payload?: Readonly<Record<string, unknown>>;
}

export interface GraphJsonEdge {
  readonly sourceId: string;
  readonly targetId: string;
}

export interface GraphJsonDocument {
  readonly version?: number;
  readonly nodes: readonly GraphJsonNode[];
  readonly edges: readonly GraphJsonEdge[];
}

export function assertGraphInvariants(graph: GraphJsonDocument): void {
  const nodeIds = graph.nodes.map((node) => node.id);
  const uniqueNodeIds = new Set(nodeIds);
  expect(uniqueNodeIds.size).toBe(nodeIds.length);

  const edgeKeys = graph.edges.map((edge) => `${edge.sourceId}->${edge.targetId}`);
  const uniqueEdgeKeys = new Set(edgeKeys);
  expect(uniqueEdgeKeys.size).toBe(edgeKeys.length);

  for (const edge of graph.edges) {
    expect(uniqueNodeIds.has(edge.sourceId)).toBe(true);
    expect(uniqueNodeIds.has(edge.targetId)).toBe(true);
  }

  const headNodes = graph.nodes.filter((node) => node.id === "head");
  expect(headNodes.length).toBeLessThanOrEqual(1);

  const headEdges = graph.edges.filter((edge) => edge.sourceId === "head");
  expect(headEdges.length).toBeLessThanOrEqual(1);

  const refNodes = graph.nodes.filter((node) => node.id.startsWith("ref:"));

  for (const refNode of refNodes) {
    const refOutEdges = graph.edges.filter((edge) => edge.sourceId === refNode.id);
    expect(refOutEdges.length).toBeLessThanOrEqual(1);
  }

  for (const node of graph.nodes) {
    expect(node.id.endsWith(".lock")).toBe(false);
  }
}

export function assertHeadPointsToBranch(graph: GraphJsonDocument, branchName: string): void {
  expect(
    graph.edges.some(
      (edge) =>
        edge.sourceId === "head" &&
        edge.targetId === `ref:refs/heads/${branchName}`,
    ),
  ).toBe(true);
}

export function assertRefPointsToCommit(
  graph: GraphJsonDocument,
  branchName: string,
  sha: string,
): void {
  expect(
    graph.edges.some(
      (edge) =>
        edge.sourceId === `ref:refs/heads/${branchName}` &&
        edge.targetId === `commit:${sha}`,
    ),
  ).toBe(true);
}

export function assertCommitParent(
  graph: GraphJsonDocument,
  childSha: string,
  parentSha: string,
): void {
  expect(
    graph.edges.some(
      (edge) =>
        edge.sourceId === `commit:${childSha}` &&
        edge.targetId === `commit:${parentSha}`,
    ),
  ).toBe(true);
}

export function assertRootCommit(graph: GraphJsonDocument, sha: string): void {
  const parentEdges = graph.edges.filter(
    (edge) =>
      edge.sourceId === `commit:${sha}` &&
      edge.targetId.startsWith("commit:"),
  );

  expect(parentEdges).toHaveLength(0);
}

export function assertRefDoesNotPointToCommit(
  graph: GraphJsonDocument,
  branchName: string,
  sha: string,
): void {
  expect(
    graph.edges.some(
      (edge) =>
        edge.sourceId === `ref:refs/heads/${branchName}` &&
        edge.targetId === `commit:${sha}`,
    ),
  ).toBe(false);
}

// Backward-compatible alias for existing tests.
export const expectGraphInvariants = assertGraphInvariants;
