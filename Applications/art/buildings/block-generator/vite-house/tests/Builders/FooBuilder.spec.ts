import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { Foo, FooBuilder } from "../../src/three/Builders/FooBuilder";

describe("FooBuilder", () => {
  it("builds a box using dimensions passed to Foo", () => {
    const sut = new FooBuilder();

    const built = sut.build(new Foo(2, 3, 4));

    expect(built).toBeInstanceOf(THREE.Mesh);

    const mesh = built as THREE.Mesh;
    expect(mesh.geometry).toBeInstanceOf(THREE.BoxGeometry);

    const geometry = mesh.geometry as THREE.BoxGeometry;
    expect(geometry.parameters.width).toBe(2);
    expect(geometry.parameters.height).toBe(3);
    expect(geometry.parameters.depth).toBe(4);
  });

  it("applies position from Foo", () => {
    const built = new FooBuilder().build(
      new Foo(1, 1, 1, {
        position: new THREE.Vector3(7, 8, 9),
      }),
    );

    expect(built.position.x).toBe(7);
    expect(built.position.y).toBe(8);
    expect(built.position.z).toBe(9);
  });
});
