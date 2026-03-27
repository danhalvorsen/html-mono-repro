
// ============================================================================
// FILE: src/three/Builders/Cylinder/CylinderBuilder.ts
// ============================================================================

import * as THREE from "three";
import { defaultMaterial } from "../../Factories/defaultMaterial.js";
import type { ICylinder } from "./Cylinder.js";

export class CylinderBuilder {
  public build(configuration: ICylinder): THREE.Object3D {
    const geometry = new THREE.CylinderGeometry(
      configuration.radiusTop,
      configuration.radiusBottom,
      configuration.height,
      configuration.radialSegments,
    );

    return new THREE.Mesh(geometry, defaultMaterial());
  }
}