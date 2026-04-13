import * as THREE from "three";

export interface IPrimitiveNode {
  readonly name: string;
  operation(): void;
  instantiate(): THREE.Object3D;
  cloneNode(): IPrimitiveNode;
  getChildren(): readonly IPrimitiveNode[];
}