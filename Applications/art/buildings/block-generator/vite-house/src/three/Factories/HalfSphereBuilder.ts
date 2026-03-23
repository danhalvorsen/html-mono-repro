import * as THREE from "three";
import { defaultMaterial } from "./defaultMaterial";
import type { IPrimitiveBuilder } from "./IPrimitiveBuilder";
import type { IPrimitiveRequest } from "./IPrimitiveRequest";
import { PrimitiveType } from "./PrimitiveType";

export class HalfSphereBuilder implements IPrimitiveBuilder {
    public readonly type = PrimitiveType.HalfSphere;

    public build(r: IPrimitiveRequest): THREE.Object3D {
        const g = new THREE.SphereGeometry(
            r.radius ?? 1,
            r.segments ?? 16,
            r.segments ?? 12,
            0,
            Math.PI * 2,
            0,
            Math.PI / 2
        );
        return new THREE.Mesh(g, defaultMaterial());
    }
}
