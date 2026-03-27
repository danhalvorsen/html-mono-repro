    import * as THREE from "three";
    import type { IResizeAware } from "../events/IResizeAware.js";    

export interface IThreeCamera extends IResizeAware {
    getCamera(): THREE.PerspectiveCamera;
}
