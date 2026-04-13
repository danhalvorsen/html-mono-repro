import { IShapeEdgeDefinition } from "./IShapeEdgeDefinition.js";
import { IShapeVertexDefinition } from "./IShapeVertexDefinition.js";

export interface IShapeTopologyDefinition {
  readonly vertices: readonly IShapeVertexDefinition[];
  readonly edges: readonly IShapeEdgeDefinition[];
}
