// ============================================================================
// FILE: src/three/Builders/Pyramid/PyramidBuilder.ts
// ============================================================================
import * as THREE from "three";
import { defaultMaterial } from "../../Factories/defaultMaterial.js";
export class PyramidBuilder {
    build(configuration) {
        // Cone with zero top radius → pyramid when radialSegments is low (e.g. 4)
        const geometry = new THREE.ConeGeometry(configuration.radius, configuration.height, configuration.radialSegments);
        return new THREE.Mesh(geometry, defaultMaterial());
    }
}
//# sourceMappingURL=PyramidBuilder.js.map