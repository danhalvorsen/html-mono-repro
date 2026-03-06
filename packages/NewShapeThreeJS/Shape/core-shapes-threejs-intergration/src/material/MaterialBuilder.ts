// packages/NewShapeThreeJS/core-shapes-threejs-samples/src/material/MaterialBuilder.ts
import type { Material, Texture } from "three";
import { MeshStandardMaterial } from "three";
import type { IBuilder } from "../contracts/IBuilder.js";

export type MaterialBuildOptions = Readonly<{
  texture?: Texture;
  roughness?: number;
  metalness?: number;
}>;
