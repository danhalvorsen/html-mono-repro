import type { MxGraphStencilDocument } from "../domain/MxGraphStencilDocument.js";
import type { MxGraphShape } from "../domain/MxGraphShape.js";

export interface IMxGraphShapeParser {
  getDocumentName(xml: string): string;
  parse(xml: string): readonly MxGraphShape[];
  parseDocument(xml: string): MxGraphStencilDocument;
}