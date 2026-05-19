// ====================================================================================
// FILE: three/builders/ITokenMaterialMeshBuilder.ts
// ====================================================================================

import * as THREE from "three";
import type { MaterialToken } from "@monorepo/core-threejs-app-framework/src/Materials/MaterialToken.js";
import type { IMeshBuilder } from "./IMeshBuilder";

export interface ITokenMaterialMeshBuilder
  extends IMeshBuilder<ITokenMaterialMeshBuilder, THREE.Mesh> {
  withMaterialToken(token: MaterialToken): ITokenMaterialMeshBuilder;
}