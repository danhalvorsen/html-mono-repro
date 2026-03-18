// ====================================================================================
// FILE: three/materials/IMaterialFactory.ts
// ====================================================================================

import * as THREE from "three";
import type { MaterialToken } from "./MaterialToken.js";

export interface IMaterialFactory {
  create(token: MaterialToken): THREE.Material;
}