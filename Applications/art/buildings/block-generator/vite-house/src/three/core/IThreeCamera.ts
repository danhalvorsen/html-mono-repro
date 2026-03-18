    import * as THREE from "three";
    import type { IResizeAware } from "./IResizeAware";    

export interface IThreeCamera extends IResizeAware {
    getCamera(): THREE.PerspectiveCamera;
}
