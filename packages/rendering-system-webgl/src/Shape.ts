
import { Vector3, Matrix} from '@my-graphics/core-math';
import { IDimensions } from './dimensions.js';
import { ILocation } from './location.js';
import { IShape } from './IShape.js';
 
export class Shape implements IShape {
  id: string;
  private position: Vector3;
  private width: number;
  private height: number;
  private rotation: Matrix;

  constructor(
    id: string,
    position: Vector3,
    width: number,
    height: number,
    rotation?: Matrix
  ) {
    this.id = id;
    this.position = position;
    this.width = width;
    this.height = height;
    this.rotation = rotation ?? new Matrix([
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ]); // or Matrix.identity() if it exists
  }

  setLocation(location: Vector3): void {
    this.position = location;
  }

  getLocation(): ILocation {
    return {
      x: this.position.x,
      y: this.position.y,
      z: this.position.z,
      getPosition: () => this.position,
      setPosition: (pos: Vector3) => { this.position = pos; }
    };
  }

  getDimensions(): IDimensions {
    return {
      getWidth: () => this.width,
      getHeight: () => this.height,
      setWidth: (w: number) => { this.width = w; },
      setHeight: (h: number) => { this.height = h; }
    };
  }

  getWidth(): number {
    return this.width;
  }

  setHeight(value: number): number {
    this.height = value;
    return this.height;
  }

  getHeight(): number {
    return this.height;
  }

  /**
   * Gets the rotation matrix of the shape.
   * @returns The current rotation matrix.
   */
  getRotation(): Matrix {
    return this.rotation;
  }

  setIdentity(matrix: Matrix): void {
    this.rotation = matrix;
  }
}
