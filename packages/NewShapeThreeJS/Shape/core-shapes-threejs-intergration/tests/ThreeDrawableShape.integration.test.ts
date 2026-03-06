// packages/NewShapeThreeJS/core-shapes-threejs-samples/Tests/ThreeDrawableShape.integration.test.ts
import { describe, it, expect } from "vitest";
import { Scene } from "three";

import {  ThreeDrawableShapeFactory, BoxMeshBuilder, StandardMaterialBuilder } from '../src/index.js'

describe("ThreeDrawableShapeFactory (integration)", () => {
  it("creates a drawable shape that adds exactly one mesh to the scene on draw()", () => {
    const scene = new Scene();

    const mat = new StandardMaterialBuilder().withRoughness(0.8).withMetalness(0.1).build();
    const meshBuilder = new BoxMeshBuilder(mat).withSize(1, 2, 3);

    const factory = new ThreeDrawableShapeFactory("box", meshBuilder);

    const shape = factory.make();

    expect(scene.children.length).toBe(0);

    shape.draw({ scene });
    shape.draw({ scene });

    expect(scene.children.length).toBe(1);
    expect(shape.type).toBe("box");
  });
});