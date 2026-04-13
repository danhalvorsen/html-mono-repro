import { ShapeTopology } from "./types.js";


export interface IShapeTopologyFactory<TTopologyInput> {
  create(input: TTopologyInput): ShapeTopology;
}
