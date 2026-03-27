// ============================================================================
// FILE: src/three/Builders/Box/BoxBuilder.ts
// ============================================================================

import * as THREE from "three";
import { defaultMaterial } from "../../Factories/defaultMaterial.js";
import type { IBox } from "./box.js";

export class BoxBuilder {
  public build(configuration: IBox): THREE.Object3D {
    const geometry = new THREE.BoxGeometry(
      configuration.width,
      configuration.height,
      configuration.depth,
    );

    return new THREE.Mesh(geometry, defaultMaterial());
  }
}