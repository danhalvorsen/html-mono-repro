import * as THREE from "three";
import { defaultMaterial } from "./defaultMaterial";
import type { IPrimitiveBuilder } from "./IPrimitiveBuilder";
import type { IPrimitiveRequest } from "./IPrimitiveRequest";
import { PrimitiveType } from "./PrimitiveType";

export class PyramidBuilder implements IPrimitiveBuilder {
    public readonly type = PrimitiveType.Pyramid;

    public build(r: IPrimitiveRequest): THREE.Object3D {
        const g = new THREE.ConeGeometry(
            r.radius ?? 1,
            r.height ?? 1,
            4
        );
        return new THREE.Mesh(g, defaultMaterial());
    }
}
