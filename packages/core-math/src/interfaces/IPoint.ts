export interface Point2 {
  x: number;
  y: number;
}

export interface Point3 extends Point2 {
  z: number;
}

// Alias: semantic equivalence
export type Vector2 = Point2;
export type Vector3 = Point3;
