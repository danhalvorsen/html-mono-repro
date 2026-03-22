import type { IEdge } from "../Edge/IEdge";
import type { IShape } from "../../Shape/IShape";
import type { IVertex } from "../Vertex/IVertex";

export interface IPolygon extends IShape {
  readonly kind: 'polygon';
  readonly vertices: readonly IVertex[];
  readonly edges: readonly IEdge[];
  readonly closed: boolean;
}
