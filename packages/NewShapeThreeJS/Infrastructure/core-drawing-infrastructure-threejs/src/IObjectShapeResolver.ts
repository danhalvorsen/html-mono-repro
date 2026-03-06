// packages/NewShapeThreeJS/Infrastructure/core-drawing-infrastructure-threejs/src/IObjectShapeResolver.ts

import type { Object3D } from "three";
 
export interface IObjectShapeResolver<TShape> {
  resolveIdentifierKey(object: Object3D): TShape | undefined;
}