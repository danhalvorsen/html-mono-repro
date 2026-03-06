import { Object3D } from "three/src/Three.js";
import { IThreeShape } from "./IThreeShape.js";


export interface IThreeShapeFactory {
    create(type: string, object3D: Object3D): IThreeShape;
}
