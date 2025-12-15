/* ============================================================
   IGeometryNode.ts
   ============================================================ */
import * as THREE from "three";

// Interface for all geometry nodes
export interface IGeometryNode {
  group: THREE.Group;
  mount(scene: THREE.Scene): void;
  update(dt: number): void;
  dispose(): void;
  add?(node: IGeometryNode): void;
}

