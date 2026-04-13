import type { GraphSvgConnectionPointShape } from "./NodeSvgShape.js";


export interface GraphConnectionPointEdgeDraft {
  readonly sourceBoxId: string;
  readonly sourceConnectionPointId: string;
  readonly sourceConnector: GraphSvgConnectionPointShape["connector"];
  readonly currentConnector: GraphSvgConnectionPointShape["connector"];
}
