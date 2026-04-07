import { expect } from "vitest";
import type { IPoint3 } from "../../src/IRectGeometryService.js";

export class RectAssertionsFixture {
  public assertPoint(point: IPoint3, x: number, y: number, z: number): void {
    expect(point.x).toBeCloseTo(x, 8);
    expect(point.y).toBeCloseTo(y, 8);
    expect(point.z).toBeCloseTo(z, 8);
  }
}
