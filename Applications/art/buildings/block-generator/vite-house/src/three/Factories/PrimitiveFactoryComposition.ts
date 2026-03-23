import { BoxBuilder } from "./BoxBuilder";
import { CylinderBuilder } from "./CylinderBuilder";
import { HalfSphereBuilder } from "./HalfSphereBuilder";
import type { IPrimitiveFactory } from "./IPrimitiveFactory";
import { PrimitiveFactory } from "./PrimitiveFactory";
 
import { PyramidBuilder } from "./PyramidBuilder";
import { SphereBuilder } from "./SphereBuilder";

// =====================================================
// COMPOSITION ROOT
// =====================================================

export class PrimitiveFactoryComposition {
    public static create(): IPrimitiveFactory {
        return new PrimitiveFactory([
            new BoxBuilder(),
            new SphereBuilder(),
            new CylinderBuilder(),
            new PyramidBuilder(),
            new HalfSphereBuilder(),
        ]);
    }
}
