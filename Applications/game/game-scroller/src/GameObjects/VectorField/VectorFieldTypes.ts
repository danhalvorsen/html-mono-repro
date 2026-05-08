export interface Vector2 {
  readonly x: number;
  readonly y: number;
}

export interface VectorFieldBounds {
  readonly width: number;
  readonly height: number;
}

export interface INoise3 {
  sample(x: number, y: number, z: number): number;
}

export interface IVectorField {
  sample(position: Vector2, timeSeconds: number): Vector2;
}