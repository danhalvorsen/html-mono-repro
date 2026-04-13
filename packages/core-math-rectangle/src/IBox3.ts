import { Vector3Gpu } from "@monorepo/core-math-gpu";


export interface IBox3 {
  getVertices(): readonly Vector3Gpu[];
  getEdges(): readonly (readonly [Vector3Gpu, Vector3Gpu])[];

  getAxes(): readonly Vector3Gpu[];

  width(): number;
  height(): number;
  depth(): number;
  volume(): number;
  center(): Vector3Gpu;

  contains(point: Vector3Gpu): boolean;
}
