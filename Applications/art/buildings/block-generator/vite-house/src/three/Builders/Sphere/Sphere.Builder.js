// ============================================================================
// FILE: src/three/Builders/Sphere/SphereBuilder.ts
// ============================================================================
import * as THREE from "three";
import { defaultMaterial } from "../../Factories/defaultMaterial.js";
export class SphereBuilder {
    build(configuration) {
        const geometry = new THREE.SphereGeometry(configuration.radius, configuration.widthSegments, configuration.heightSegments);
        return new THREE.Mesh(geometry, defaultMaterial());
    }
}
//# sourceMappingURL=Sphere.Builder.js.map