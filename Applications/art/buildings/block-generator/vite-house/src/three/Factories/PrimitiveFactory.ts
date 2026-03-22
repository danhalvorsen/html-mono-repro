import * as THREE from "three";
import type { IPrimitiveBuilder } from "./IPrimitiveBuilder";
import type { IPrimitiveFactory } from "./IPrimitiveFactory";
import type { IPrimitiveRequest } from "./IPrimitiveRequest";

// =====================================================
// FACTORY
// =====================================================

export class PrimitiveFactory implements IPrimitiveFactory {
    private readonly map = new Map<string, IPrimitiveBuilder>();

    public constructor(builders: readonly IPrimitiveBuilder[]) {
        for (const b of builders) {
            if (this.map.has(b.type.key)) {
                throw new Error(`Duplicate builder: ${b.type.key}`);
            }
            this.map.set(b.type.key, b);
        }
    }

    public create(request: IPrimitiveRequest): THREE.Object3D {
        const builder = this.map.get(request.type.key);
        if (!builder) {
            throw new Error(`No builder for type '${request.type.key}'`);
        }
        return builder.build(request);
    }
}
