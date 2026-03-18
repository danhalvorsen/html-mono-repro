// ====================================================================================
// FILE: three/materials/providers/WindowGlassMaterialProvider.ts
// ====================================================================================

import * as THREE from "three";
import { MaterialToken } from "../MaterialToken";
import type { IMaterialProvider } from "./IMaterialProvider";

export class WindowGlassMaterialProvider implements IMaterialProvider {
  public supports(token: MaterialToken): boolean {
    return token === MaterialToken.WindowGlass;
  }

  public create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x7fa8c9,
      emissive: 0x1b3042,
      roughness: 0.15,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
  }
}