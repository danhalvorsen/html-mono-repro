import * as THREE from "three";
import type { IResizeAware } from "./IResizeAware";
 
export interface IThreeRenderer extends IResizeAware {
    getRenderer(): THREE.WebGLRenderer;
    render(scene: THREE.Scene, camera: THREE.Camera): void;
}
