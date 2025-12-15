// src/LineSegment.ts
import * as THREE from "three";
import { VectorField } from "./VectorField.js";

export class LineSegment {
    private geometry: THREE.BufferGeometry;
    private line: THREE.Line;
    private offset = 0;

    constructor(
        private field: VectorField,
        private start: THREE.Vector3,
        private steps: number,
        private stepSize: number,
        private segmentLength: number,
        private speed: number,
        private color: number,
        scene: THREE.Scene
    ) {
        this.geometry = this.build();
        this.line = new THREE.Line(
            this.geometry,
            new THREE.LineBasicMaterial({ color: this.color, transparent: true })
        );
        scene.add(this.line);
    }

    private build(): THREE.BufferGeometry {
        const pts: THREE.Vector3[] = [];

        let x = this.start.x,
            y = this.start.y,
            z = this.start.z;

        for (let i = 0; i < this.steps; i++) {
            pts.push(new THREE.Vector3(x, y, z));
            const v = this.field.sample(x, y, z);
            x += v.x * this.stepSize;
            y += v.y * this.stepSize;
            z += v.z * this.stepSize;
        }

        const g = new THREE.BufferGeometry().setFromPoints(pts);
        g.setDrawRange(0, 1);
        return g;
    }

    update() {
        this.offset += this.speed;

        const total = this.geometry.attributes.position.count;
        const seg = this.segmentLength;

        const start = Math.floor(this.offset) % total;
        const end = (start + seg) % total;

        if (end > start) {
            this.geometry.setDrawRange(start, seg);
        } else {
            this.geometry.setDrawRange(start, total - start);
        }
    }
}
