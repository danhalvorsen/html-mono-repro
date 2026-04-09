import type { GraphJsonDocument } from "../../src/GraphJsonDocument.js";

export const graphJsonDocumentFixtures = {
  validSimple: (): GraphJsonDocument => ({
    nodes: [
      { id: "A", payload: undefined },
      { id: "B", payload: undefined },
    ],
    edges: [
      { sourceId: "A", targetId: "B" },
    ],
  }),

  validWithPayloads: (): GraphJsonDocument => ({
    nodes: [
      { id: "A", payload: { x: 1 } },
      { id: "B", payload: { y: 2 } },
    ],
    edges: [
      { sourceId: "A", targetId: "B" },
    ],
  }),

  empty: (): GraphJsonDocument => ({
    nodes: [],
    edges: [],
  }),

  multiNode: (): GraphJsonDocument => ({
    nodes: [
      { id: "A", payload: undefined },
      { id: "B", payload: undefined },
      { id: "C", payload: undefined },
    ],
    edges: [
      { sourceId: "A", targetId: "B" },
      { sourceId: "B", targetId: "C" },
    ],
  }),

  singleDirection: (): GraphJsonDocument => ({
    nodes: [
      { id: "A", payload: undefined },
      { id: "B", payload: undefined },
    ],
    edges: [
      { sourceId: "A", targetId: "B" },
    ],
  }),

  cycle: (): GraphJsonDocument => ({
    nodes: [
      { id: "A", payload: undefined },
      { id: "B", payload: undefined },
    ],
    edges: [
      { sourceId: "A", targetId: "B" },
      { sourceId: "B", targetId: "A" },
    ],
  }),

  missingNodesArray: (): Partial<GraphJsonDocument> => ({
    edges: [],
  }),

  missingEdgesArray: (): Partial<GraphJsonDocument> => ({
    nodes: [],
  }),

  duplicateNodeId: (): GraphJsonDocument => ({
    nodes: [
      { id: "A", payload: undefined },
      { id: "A", payload: undefined },
    ],
    edges: [],
  }),

  edgeWithMissingSource: (): GraphJsonDocument => ({
    nodes: [
      { id: "A", payload: undefined },
    ],
    edges: [
      { sourceId: "X", targetId: "A" },
    ],
  }),

  edgeWithMissingTarget: (): GraphJsonDocument => ({
    nodes: [
      { id: "A", payload: undefined },
    ],
    edges: [
      { sourceId: "A", targetId: "X" },
    ],
  }),
};
