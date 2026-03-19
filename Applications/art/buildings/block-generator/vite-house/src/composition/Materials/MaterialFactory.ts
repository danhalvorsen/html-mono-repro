// ====================================================================================
// FILE: three/materials/MaterialFactory.ts
// ====================================================================================

import * as THREE from "three";
import type { IMaterialFactory } from "./IMaterialFactory.js";
import type { MaterialToken } from "./MaterialToken.js";

export class MaterialFactory implements IMaterialFactory {
  public create(token: MaterialToken): THREE.Material {
    switch (token) {
      case "building-white":
        return new THREE.MeshStandardMaterial({ color: 0xf5f2f7 });
      case "building-blue":
        return new THREE.MeshStandardMaterial({ color: 0x39b7e8 });
      case "building-yellow":
        return new THREE.MeshStandardMaterial({ color: 0xf1d54a });
      case "building-red":
        return new THREE.MeshStandardMaterial({ color: 0xef5a7a });
      case "grass":
        return new THREE.MeshStandardMaterial({ color: 0xb7d77a });
      case "roof-light":
        return new THREE.MeshStandardMaterial({ color: 0x0000f7 });
      case "roof-accent":
        return new THREE.MeshStandardMaterial({ color: 0xff00ff });
      case "window-glass":
        return new THREE.MeshStandardMaterial({
          color: 0x7dddf6,
          transparent: true,
          opacity: 0.92,
        });
      case "window-frame":
        return new THREE.MeshStandardMaterial({ color: 0xf4edf7 });
      case "window-glass-dark": 
        return new THREE.MeshStandardMaterial({
          color: 0x1f2a38,
          emissive: 0x0a1118,
          roughness: 0.25,
          metalness: 0.1,
          transparent: true,
          opacity: 0.85,
        });
      case "balcony":
        return new THREE.MeshStandardMaterial({ color: 0xf3eef7 });
      case "tree-leaf":
        return new THREE.MeshStandardMaterial({ color: 0x9fbc4b });
      case "tree-trunk":
        return new THREE.MeshStandardMaterial({ color: 0x8a6a43 });
      case "road":
        return new THREE.MeshStandardMaterial({ color: 0x555555 });
      case "water":
        return new THREE.MeshStandardMaterial({ color: 0x4a90e2 });
      default: {
        const exhaustive: never = token;
        throw new Error(`Unsupported material token: ${String(exhaustive)}`);
      }
    }
  }
}
