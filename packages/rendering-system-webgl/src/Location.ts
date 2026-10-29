import { Vector3 } from "@monorepo/core-math";
import { ILocation } from "./ILocation";

export class Location implements ILocation {
  private position: Vector3;

  constructor(position: Vector3) {
    this.position = position.clone();
  }

  get x(): number {
    return this.position.x;
  }

  get y(): number {
    return this.position.y;
  }

  get z(): number {
    return this.position.z;
  }

  getPosition(): Vector3 {
    return this.position.clone();
  }

  setPosition(pos: Vector3): void {
    this.position = pos.clone();
  }
}

