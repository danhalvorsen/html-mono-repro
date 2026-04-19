import { Vector2Gpu } from "@monorepo/core-math-gpu";

// ============================================================================
// CONTRACTS
// ============================================================================

export interface IBox2 {
  getVertices(): readonly Vector2Gpu[];
  getEdges(): readonly (readonly [Vector2Gpu, Vector2Gpu])[];

  getAxes(): readonly Vector2Gpu[];

  width(): number;
  height(): number;
  area(): number;
  perimeter(): number;
  center(): Vector2Gpu;

  contains(point: Vector2Gpu): boolean;
}
