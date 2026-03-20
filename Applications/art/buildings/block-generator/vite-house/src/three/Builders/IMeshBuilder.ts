
import * as THREE from "three";

export interface IMeshBuilder<TBuilder, TResult> {
  withGeometry(geometry: THREE.BufferGeometry): TBuilder;
  withMaterial(material: THREE.Material): TBuilder;

  withPosition(x: number, y: number, z: number): TBuilder;
  withRotation(x: number, y: number, z: number): TBuilder;
  withScale(x: number, y: number, z: number): TBuilder;

  withShadow(cast: boolean, receive: boolean): TBuilder;

  build(): TResult;
}