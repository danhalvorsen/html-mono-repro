import * as THREE from "three";
import type { PrimitiveRequest } from "./PrimitiveRequest";


export interface IPrimitiveFactory {
	create(request: PrimitiveRequest): THREE.Object3D;
}
