import type { IPoint, PointPosition } from "./ipoint.js";

let nextPointId = 0;

export class Point implements IPoint {
  public readonly id: string;
  public readonly label: string;
  protected currentPosition: PointPosition;

  public constructor(x: number, y: number, label: string, id?: string) {
    this.id = id ?? `point-${++nextPointId}`;
    this.label = label;
    this.currentPosition = { x, y };
  }

  public get x(): number {
    return this.currentPosition.x;
  }

  public get y(): number {
    return this.currentPosition.y;
  }

  public get position(): PointPosition {
    return this.currentPosition;
  }

  public get movable(): boolean {
    return false;
  }

  public moveTo(_position: PointPosition): boolean {
    return false;
  }

  protected setPosition(position: PointPosition): void {
    this.currentPosition = { x: position.x, y: position.y };
  }
}
