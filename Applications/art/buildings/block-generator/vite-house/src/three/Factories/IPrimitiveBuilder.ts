import * as THREE from "three";
import type { IPrimitiveRequest } from "./IPrimitiveRequest";
import type { IPrimitiveType } from "./IPrimitiveType";

// =====================================================
// STRATEGY CONTRACT (OCP)
// =====================================================

export interface IPrimitiveBuilder {
    readonly type: IPrimitiveType;
    build(request: IPrimitiveRequest): THREE.Object3D;
}
