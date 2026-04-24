import { Vector3, Matrix } from '@monorepo/core-math';
import { IDimensions } from './IDimensions.js';
import { ILocation } from './ILocation.js';
 
export interface IShape {
  id: string;

  setLocation(location: Vector3): void;
  getLocation(): ILocation;

  getDimensions(): IDimensions;
  getWidth(): number;

  setHeight(value: number): number;
  getHeight(): number;

  getRotation(): Matrix;
  setIdentity(matrix: Matrix): void;
}

export interface IShapeBounded extends IShape {
  bounds: {
    width: number;
    height: number;
  };
}
