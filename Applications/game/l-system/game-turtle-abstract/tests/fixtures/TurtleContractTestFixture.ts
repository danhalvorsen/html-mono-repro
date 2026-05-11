import { expect } from "vitest";
import {
  DefaultTurtleFactory,
  type ITurtle3D,
  type TurtlePrimitive,
  type TurtleSnapshot,
  type Vector3,
} from "../../src/index.js";

export class TurtleContractTestFixture {
  public createTurtle(): ITurtle3D {
    return new DefaultTurtleFactory().create3D();
  }

  public expectDefault3DState(snapshot: TurtleSnapshot): void {
    this.expectVectorClose(snapshot.position, { x: 0, y: 0, z: 0 });
    this.expectVectorClose(snapshot.forward, { x: 1, y: 0, z: 0 });
    this.expectVectorClose(snapshot.left, { x: 0, y: 1, z: 0 });
    this.expectVectorClose(snapshot.up, { x: 0, y: 0, z: 1 });

    expect(snapshot.isPenDown).toBe(true);
    expect(snapshot.mode).toBe("3d");
  }

  public expectVectorClose(
    actual: Vector3,
    expected: Vector3,
    precision = 8,
  ): void {
    expect(actual.x).toBeCloseTo(expected.x, precision);
    expect(actual.y).toBeCloseTo(expected.y, precision);
    expect(actual.z).toBeCloseTo(expected.z, precision);
  }

  public expectLinePrimitive(
    primitive: TurtlePrimitive,
    expectedFrom: Vector3,
    expectedTo: Vector3,
  ): void {
    expect(primitive.kind).toBe("line");

    const line = primitive as {
      readonly kind: "line";
      readonly from: Vector3;
      readonly to: Vector3;
    };

    this.expectVectorClose(line.from, expectedFrom);
    this.expectVectorClose(line.to, expectedTo);
  }
}