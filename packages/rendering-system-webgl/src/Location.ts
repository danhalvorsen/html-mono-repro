import { Vector3 } from '@my-graphics/core-math';
import { ILocation } from '@my-graphics/types-abstract';

export class Location implements ILocation {
  constructor(private position: Vector3) {
    this.position = new Vector3(position.x, position.y, 0);
  }
  x: number = 0;
  y: number = 0;
  z: number = 0;
  getPosition(): Vector3 {
    return (
      this.position.clone?.() ??
      new Vector3(this.position.x, this.position.y, this.position.z)
    );
  }

  setPosition(pos: Vector3): void {
    this.position = pos.clone?.() ?? new Vector3(pos.x, pos.y, pos.z);
  }
}