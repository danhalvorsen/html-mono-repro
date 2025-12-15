// src/LineSegmentBuilder.ts
import * as THREE from "three";
import { VectorField } from "./VectorField.js";
import { LineSegment } from "./LineSegment.js";

export class LineSegmentBuilder {
    FadeTail(_arg0: number) {
     return this;
    }
    width(_width: number) {
        return this;
    }
    private _start = new THREE.Vector3(0, 0, 0);
    private _steps = 200;
    private _stepSize = 0.05;
    private _segmentLength = 20;
    private _speed = 1.0;
    private _color = 0xffffff;

    constructor(private field: VectorField) {}

    start(v: THREE.Vector3): this { this._start = v.clone(); return this; }
    steps(n: number): this { this._steps = n; return this; }
    stepSize(v: number): this { this._stepSize = v; return this; }
    segmentLength(v: number): this { this._segmentLength = v; return this; }
    speed(v: number): this { this._speed = v; return this; }
    color(v: number): this { this._color = v; return this; }

    build(scene: THREE.Scene): LineSegment {
        return new LineSegment(
            this.field,
            this._start,
            this._steps,
            this._stepSize,
            this._segmentLength,
            this._speed,
            this._color,
            scene
        );
    }
}
