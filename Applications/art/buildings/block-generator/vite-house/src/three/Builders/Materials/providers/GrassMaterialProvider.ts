// ====================================================================================
// FILE: three/materials/providers/GrassMaterialProvider.ts
// ====================================================================================

import * as THREE from "three";

import type { IMaterialProvider } from "./IMaterialProvider";

export class GrassMaterialProvider implements IMaterialProvider {
  public supports(token: string): boolean {
    return token === "Grass";
  }

  public create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      roughness: 1,
      metalness: 0,
    });
  }
}