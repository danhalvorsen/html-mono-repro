import * as THREE from "three";
import { CompositeBuilder } from "./CompositeBuilder.js";
import type { IPrimitiveNodeFactory } from "../IPrimitiveNodeFactory.js";
import { type IPrimitiveNode } from "@monorepo/core-design-pattern-composite-tree-threejs";
import { Cylinder } from "./Cylinder/Cylinder.js";
import { HalfSphere } from "./HalfSphere/HalfSphere.js";

export class TowerTemplateBuilder {
  public constructor(
    private readonly factory: IPrimitiveNodeFactory,
  ) {}

  public build(name: string): IPrimitiveNode {
    return new CompositeBuilder(this.factory, name)
      .addCylinder(
        "Core",
        new Cylinder(0.75, 0.75, 5.0, 20),
        {
          position: new THREE.Vector3(0, 2.5, 0),
        },
      )
      .addHalfSphere(
        "Dome",
        new HalfSphere(0.9, 20),
        {
          position: new THREE.Vector3(0, 5.0, 0),
        },
      )
      .build();
  }
}
