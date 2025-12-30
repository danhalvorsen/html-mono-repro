import { Vector3 } from '@my-graphics/core-math';

export interface ILocation {
  x: number;
  y: number;
  z: number;
  getPosition(): Vector3;
  setPosition(position: Vector3): void;
}
