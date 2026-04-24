import { Vector3 } from '@monorepo/core-math';

export interface ILocation {
  x: number;
  y: number;
  z: number;
  getPosition(): Vector3;
  setPosition(position: Vector3): void;
}
