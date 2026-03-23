import { BoxBuilder } from "./BoxBuilder";
import { CylinderBuilder } from "./CylinderBuilder";
import { PlaneBuilder, TorusBuilder, TorusKnotBuilder, CapsuleBuilder, RingBuilder, CircleBuilder, DodecahedronBuilder, IcosahedronBuilder, OctahedronBuilder } from "./ExtendedPrimitiveType";
import { HalfSphereBuilder } from "./HalfSphereBuilder";
import type { IPrimitiveBuilder } from "./IPrimitiveBuilder";
import type { IPrimitiveFactory } from "./IPrimitiveFactory";
import { PrimitiveFactory } from "./PrimitiveFactory";
import { PyramidBuilder } from "./PyramidBuilder";
import { SphereBuilder } from "./SphereBuilder";

// ====================================================================================
// EXTENDED COMPOSITION ROOT
// - existing builders + extended builders
// - factory creates fresh runtime instances per request
// ====================================================================================

export class ExtendedPrimitiveFactoryComposition {
    public static create(): IPrimitiveFactory {
        const builders: readonly IPrimitiveBuilder[] = [
            new BoxBuilder(),
            new SphereBuilder(),
            new CylinderBuilder(),
            new PyramidBuilder(),
            new HalfSphereBuilder(),
            new PlaneBuilder(),
            new TorusBuilder(),
            new TorusKnotBuilder(),
            new CapsuleBuilder(),
            new RingBuilder(),
            new CircleBuilder(),
            new DodecahedronBuilder(),
            new IcosahedronBuilder(),
            new OctahedronBuilder(),
        ];

        return new PrimitiveFactory(builders);
    }
}
