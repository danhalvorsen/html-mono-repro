import * as THREE from "three";
import { IGeometryNode } from "./code2.js";

/* ============================================================
   Basic Shapes: StemShape.ts
   ============================================================ */

export class StemShape implements IGeometryNode {
    group = new THREE.Group();
    private mesh: THREE.Mesh;

    constructor(height = 1.2, color = 0x222222) {
        const geo = new THREE.BoxGeometry(0.05, height, 0.05);
        const mat = new THREE.MeshStandardMaterial({ color });
        this.mesh = new THREE.Mesh(geo, mat);
        this.group.add(this.mesh);
    }

    mount() { }
    update() { }
    dispose() { }
}
