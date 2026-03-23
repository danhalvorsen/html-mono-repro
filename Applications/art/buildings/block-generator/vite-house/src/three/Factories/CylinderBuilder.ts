import * as THREE from "three";
import { defaultMaterial } from "./defaultMaterial";
import type { IPrimitiveBuilder } from "./IPrimitiveBuilder";
import type { IPrimitiveRequest } from "./IPrimitiveRequest";
import { PrimitiveType } from "./PrimitiveType";

export class CylinderBuilder implements IPrimitiveBuilder {
    public readonly type = PrimitiveType.Cylinder;

    public build(r: IPrimitiveRequest): THREE.Object3D {
        const g = new THREE.CylinderGeometry(
            r.radius ?? 1,
            r.radius ?? 1,
            r.height ?? 1,
            r.segments ?? 16
        );
        return new THREE.Mesh(g, defaultMaterial());
    }
}
