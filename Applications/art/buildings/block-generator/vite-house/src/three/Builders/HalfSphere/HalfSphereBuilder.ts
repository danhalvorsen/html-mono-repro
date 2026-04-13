// ============================================================================
// BUILDER (pure, no serialization)
// ============================================================================

import * as THREE from "three";
import { defaultMaterial } from "../../Factories/defaultMaterial.js";
import type { IHalfSphere } from "./HalfSphere.js";

export class HalfSphereBuilder {
  public build(configuration: IHalfSphere): THREE.Object3D {
    const geometry = new THREE.SphereGeometry(
      configuration.radius,
      configuration.segments,
      Math.max(3, configuration.segments),
      0,
      Math.PI * 2,
      0,
      Math.PI / 2,
    );

    return new THREE.Mesh(geometry, defaultMaterial());
  }
}