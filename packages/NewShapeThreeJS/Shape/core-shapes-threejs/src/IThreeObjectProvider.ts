import { Object3D } from "three/src/Three.js";

export interface IThreeObjectProvider {
    getObject3D(): Object3D;
}
