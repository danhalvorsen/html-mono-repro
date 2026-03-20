// ====================================================================================
// FILE: three/materials/providers/BuildingMaterialProvider.ts
// ====================================================================================

import * as THREE from "three";
 
import { BuildingPalette } from "../BuildingPalette";
import type { IMaterialProvider } from "./IMaterialProvider";

export class BuildingMaterialProvider implements IMaterialProvider {
  public supports(token: string): boolean {
    return token.startsWith("building:");
  }

  public create(token?: string): THREE.Material {
    const variant = token?.split(":")[1] ?? "yellow";

    const map: Record<string, number> = {
      yellow: BuildingPalette.BuildingYellow,
      blue: BuildingPalette.BuildingBlue,
      red: BuildingPalette.BuildingRed,
      white: BuildingPalette.BuildingWhite,
    };

    return new THREE.MeshStandardMaterial({
      color: map[variant] ?? BuildingPalette.BuildingYellow,
      roughness: 0.85,
      metalness: 0.05,
    });
  }
}