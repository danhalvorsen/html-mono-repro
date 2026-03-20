// ====================================================================================
// FILE: three/materials/providers/WallMaterialProvider.ts
// ====================================================================================

import * as THREE from "three";
import { MaterialToken } from "../MaterialToken";
import type { IMaterialProvider } from "./IMaterialProvider";
 
export class WallMaterialProvider implements IMaterialProvider {
  public supports(token: MaterialToken): boolean {
    return token === MaterialToken.BuildingYellow;
  }

  public create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0xdac9ad,
      roughness: 0.9,
      metalness: 0.05,
    });
  }
}