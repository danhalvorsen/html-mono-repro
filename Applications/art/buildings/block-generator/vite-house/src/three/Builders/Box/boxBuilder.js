// ============================================================================
// FILE: src/three/Builders/Box/BoxBuilder.ts
// ============================================================================
import * as THREE from "three";
import { defaultMaterial } from "../../Factories/defaultMaterial.js";
export class BoxBuilder {
    build(configuration) {
        const geometry = new THREE.BoxGeometry(configuration.width, configuration.height, configuration.depth);
        return new THREE.Mesh(geometry, defaultMaterial());
    }
}
//# sourceMappingURL=boxBuilder.js.map