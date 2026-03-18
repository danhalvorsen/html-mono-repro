// ====================================================================================
// FILE: three/builders/ITokenMaterialMeshBuilder.ts
// ====================================================================================

import * as THREE from "three";
import type { IMeshBuilder } from "./IMeshBuilder";
import type { MaterialToken } from "./Materials/MaterialToken";

export interface ITokenMaterialMeshBuilder
  extends IMeshBuilder<ITokenMaterialMeshBuilder, THREE.Mesh> {
  withMaterialToken(token: MaterialToken): ITokenMaterialMeshBuilder;
}