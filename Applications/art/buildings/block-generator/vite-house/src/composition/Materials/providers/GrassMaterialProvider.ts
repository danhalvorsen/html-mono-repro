// ====================================================================================
// FILE: three/materials/providers/GrassMaterialProvider.ts
// ====================================================================================

import * as THREE from "three";
import { MaterialToken } from "../MaterialToken";
import type { IMaterialProvider } from "./IMaterialProvider";
import { BuildingPalette } from "../BuildingPalette";

export class GrassMaterialProvider implements IMaterialProvider {
  public supports(token: MaterialToken): boolean {
    return token === MaterialToken.Grass;
  }

  public create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: BuildingPalette.Grass,
      roughness: 1,
      metalness: 0,
    });
  }
}