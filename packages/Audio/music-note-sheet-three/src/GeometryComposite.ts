import * as THREE from "three";
import { IGeometryNode } from "./code2.js";

/* ============================================================
   GeometryComposite.ts
   ============================================================ */

export abstract class GeometryComposite implements IGeometryNode {
    group = new THREE.Group();
    protected children: IGeometryNode[] = [];

    add(node: IGeometryNode) {
        this.children.push(node);
        this.group.add(node.group);
    }

    mount(scene: THREE.Scene) {
        scene.add(this.group);
        for (const c of this.children) c.mount(scene);
    }

    update(dt: number) {
        for (const c of this.children) c.update(dt);
    }

    dispose() {
        for (const c of this.children) c.dispose();
    }
}
