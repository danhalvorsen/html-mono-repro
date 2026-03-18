import type { Rectangle } from "../domain/geometry/Rectangle";
import * as THREE from "three";

export interface IWindowBuilder {
  reset(): void;
  withFrame(rect: Rectangle, material: THREE.Material): IWindowBuilder;
  withGlass(material: THREE.Material, inset?: number): IWindowBuilder;
  build(): THREE.Object3D;
}

