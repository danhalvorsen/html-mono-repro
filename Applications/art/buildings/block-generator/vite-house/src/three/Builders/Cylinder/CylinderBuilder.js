// ============================================================================
// FILE: src/three/Builders/Cylinder/CylinderBuilder.ts
// ============================================================================
import * as THREE from "three";
import { defaultMaterial } from "../../Factories/defaultMaterial.js";
export class CylinderBuilder {
    build(configuration) {
        const geometry = new THREE.CylinderGeometry(configuration.radiusTop, configuration.radiusBottom, configuration.height, configuration.radialSegments);
        return new THREE.Mesh(geometry, defaultMaterial());
    }
}
//# sourceMappingURL=CylinderBuilder.js.map