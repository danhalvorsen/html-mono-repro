export interface Vector2 {
  readonly x: number;
  readonly y: number;
}

export interface Bounds {
  readonly width: number;
  readonly height: number;
}

export interface IVectorField {
  sample(position: Vector2, timeSeconds: number): Vector2;
}