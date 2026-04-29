// JGF Graph Document types
export interface JgfNode {
  id: string;
  metadata?: Record<string, unknown>;
}

export interface JgfEdge {
  id?: string;
  source: string;
  target: string;
  metadata?: Record<string, unknown>;
}

export interface JgfGraph {
  id: string;
  metadata?: Record<string, unknown>;
  nodes: JgfNode[];
  edges: JgfEdge[];
}

export interface JgfDocument {
  graph: JgfGraph;
}
