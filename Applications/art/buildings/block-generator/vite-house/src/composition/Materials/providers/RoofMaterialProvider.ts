// ====================================================================================
// FILE: three/materials/providers/RoofMaterialProvider.ts
// ====================================================================================

import * as THREE from "three";
import { MaterialToken } from "../MaterialToken";
import type { IMaterialProvider } from "./IMaterialProvider";

export class RoofMaterialProvider implements IMaterialProvider {
  public supports(token: MaterialToken): boolean {
    return token === MaterialToken.RoofAccent;
  }

  public create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x6b4f3a,
      roughness: 0.85,
      metalness: 0.1,
    });
  }
}