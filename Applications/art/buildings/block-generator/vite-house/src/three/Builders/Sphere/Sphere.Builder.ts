// ============================================================================
// FILE: src/three/Builders/Sphere/SphereBuilder.ts
// ============================================================================

import * as THREE from "three";
import { defaultMaterial } from "../../Factories/defaultMaterial.js";
import type { ISphere } from "./Sphere.js";

export class SphereBuilder {
  public build(configuration: ISphere): THREE.Object3D {
    const geometry = new THREE.SphereGeometry(
      configuration.radius,
      configuration.widthSegments,
      configuration.heightSegments,
    );

    return new THREE.Mesh(geometry, defaultMaterial());
  }
}