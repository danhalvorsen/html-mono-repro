import * as THREE from "three";
import { defaultMaterial } from "./defaultMaterial";
import type { IPrimitiveBuilder } from "./IPrimitiveBuilder";
import type { IPrimitiveRequest } from "./IPrimitiveRequest";
import { PrimitiveType } from "./PrimitiveType";

// =====================================================
// BUILDERS
// =====================================================

export class BoxBuilder implements IPrimitiveBuilder {
    public readonly type = PrimitiveType.Box;

    public build(r: IPrimitiveRequest): THREE.Object3D {
        const g = new THREE.BoxGeometry(
            r.width ?? 1,
            r.height ?? 1,
            r.depth ?? 1
        );
        return new THREE.Mesh(g, defaultMaterial());
    }
}
