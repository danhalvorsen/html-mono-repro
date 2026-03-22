import type { MaterialFactory } from "../Materials/MaterialFactory";

export interface IGroundBuilder{

}
export interface IBuilder<T> {
  buildExampleResponse(): T;
}
export interface IBuilder<T> {
    withMaterial(materialFactory: MaterialFactory): this;
    withPosition(x: number, y: number, z: number): this;
    withDimensions(width: number, height: number, depth: number): this;
}

