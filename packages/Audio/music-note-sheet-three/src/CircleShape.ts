import * as THREE from "three";
import { IGeometryNode } from "./code2.js";

/* ============================================================
   Basic Shapes: CircleShape.ts
   ============================================================ */

export class CircleShape implements IGeometryNode {
    group = new THREE.Group();
    private mesh: THREE.Mesh;

    constructor(radius = 0.2, color = 0x222222) {
        const geo = new THREE.CircleGeometry(radius, 32);
        const mat = new THREE.MeshStandardMaterial({ color });
        this.mesh = new THREE.Mesh(geo, mat);
        this.group.add(this.mesh);
    }

    mount() { }
    update() { }
    dispose() { }
}
