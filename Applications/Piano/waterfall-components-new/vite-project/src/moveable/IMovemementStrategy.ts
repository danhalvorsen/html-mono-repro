import type { Vector2 } from "@monorepo/core-math";


export interface IMovemementStrategy {
  position: Vector2;
  direction: Vector2;
  velocity: Vector2;
  initialVelocity: Vector2;
  acceleration: Vector2;
  isStarted: boolean;
  isCompleted: boolean;

  calculate(deltaSeconds: number): void;
}
