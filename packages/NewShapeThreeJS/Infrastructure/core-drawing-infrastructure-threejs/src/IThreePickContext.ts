// packages/NewShapeThreeJS/Infrastructure/core-drawing-infrastructure-threejs/src/IThreePickContext.ts

import type { Camera, Object3D } from "three";
import type { IViewport } from "@monorepo/core-drawing-infrastructure-abstract";

/**
 * Context required by the ThreeJS picker.
 * Provides the camera, viewport and objects that can be ray-tested.
 */
export interface IThreePickContext {
  readonly camera: Camera;
  readonly viewport: IViewport;
  readonly objects: ReadonlyArray<Object3D>;
}