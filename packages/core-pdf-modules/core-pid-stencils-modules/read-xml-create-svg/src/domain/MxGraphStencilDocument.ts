import type { MxGraphShape } from "./MxGraphShape.js";

export interface MxGraphStencilDocument {
  readonly sourceName: string;
  readonly rootName: string;
  readonly shapes: readonly MxGraphShape[];
}