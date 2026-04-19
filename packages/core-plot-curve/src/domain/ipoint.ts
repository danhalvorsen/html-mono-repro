import type { Point2 } from "@monorepo/core-math";

export type PointPosition = Point2;

export interface IPoint extends Point2 {
  readonly id: string;
  readonly label: string;
  readonly position: PointPosition;
  readonly movable: boolean;

  moveTo(position: PointPosition): boolean;
}
