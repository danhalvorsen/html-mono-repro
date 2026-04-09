// core.semantic.models

export type SemanticShapeId = string;
export type SemanticVertexId = string;
export type SemanticEdgeId = string;

// -----------------------------------------------------------------------------
// Semantic value model
// -----------------------------------------------------------------------------

export type SemanticValue =
  | string
  | number
  | boolean
  | readonly SemanticValue[]
  | { readonly [key: string]: SemanticValue };

