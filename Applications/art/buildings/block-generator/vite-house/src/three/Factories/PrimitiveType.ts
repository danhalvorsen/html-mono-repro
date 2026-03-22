// ====================================================================================
// FILE: PrimitiveType.ts
// ====================================================================================

import type { IPrimitiveType } from "./IPrimitiveType.js";

export class PrimitiveType implements IPrimitiveType {
  public static readonly Box = new PrimitiveType("box");
  public static readonly Sphere = new PrimitiveType("sphere");
  public static readonly Pyramid = new PrimitiveType("pyramid");
  public static readonly Cylinder = new PrimitiveType("cylinder");
  public static readonly HalfSphere = new PrimitiveType("half-sphere");

  private constructor(
    public readonly key: string,
  ) {}

  public static create(key: string): PrimitiveType {
    return new PrimitiveType(key);
  }
}