import { Matrix, Vector3 } from 'core-math/dist';
import { IDimensions } from './dimensions';
import { ILocation } from './location';


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
