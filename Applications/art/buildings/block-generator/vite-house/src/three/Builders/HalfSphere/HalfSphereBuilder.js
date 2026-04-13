// ============================================================================
// BUILDER (pure, no serialization)
// ============================================================================
import * as THREE from "three";
import { defaultMaterial } from "../../Factories/defaultMaterial.js";
export class HalfSphereBuilder {
    build(configuration) {
        const geometry = new THREE.SphereGeometry(configuration.radius, configuration.segments, Math.max(3, configuration.segments), 0, Math.PI * 2, 0, Math.PI / 2);
        return new THREE.Mesh(geometry, defaultMaterial());
    }
}
//# sourceMappingURL=HalfSphereBuilder.js.map