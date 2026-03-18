import * as THREE from "three";

export interface IGroundBuilder{

}
export interface IBuilder<T> {
  buildExampleResponse(): T;
}
export interface IBuilder<T> {
    withMaterial(material: THREE.Material): this;
    withPosition(x: number, y: number, z: number): this;
    withDimensions(width: number, height: number, depth: number): this;
}

