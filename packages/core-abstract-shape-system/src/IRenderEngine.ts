import { IShape } from "./IShape.js";
export interface IRenderEngine {
  add(shape: IShape): void;
  remove(shape: IShape): void;
}
