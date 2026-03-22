// ====================================================================================
// FILE: three/builders/ITokenMaterialMeshBuilder.ts
// ====================================================================================

import * as THREE from "three";
import type { MaterialToken } from "../Materials/MaterialToken";
import type { IMeshBuilder } from "./IMeshBuilder";

export interface ITokenMaterialMeshBuilder
  extends IMeshBuilder<ITokenMaterialMeshBuilder, THREE.Mesh> {
  withMaterialToken(token: MaterialToken): ITokenMaterialMeshBuilder;
}