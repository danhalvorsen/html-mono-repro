import * as THREE from "three";
import type { IPrimitiveRequest } from "./IPrimitiveRequest";

// =====================================================
// FACTORY CONTRACT
// =====================================================

export interface IPrimitiveFactory {
    create(request: IPrimitiveRequest): THREE.Object3D;
}
