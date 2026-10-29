import { Vector3, Matrix } from '@monorepo/core-math';
import { ILocation } from "./ILocation";
import { IDimensions } from './dimensions';


export interface IShape {
  id: string;
  getLocation(): ILocation;
  getDimensions(): IDimensions;
  getWidth(): number;
  getHeight(): number;
  getRotation(): Matrix;
  setLocation(location: Vector3): void;
  setHeight(value: number): number;
  setIdentity(matrix: Matrix): void;
}
