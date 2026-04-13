import * as THREE from "three";
import type { ISceneClock } from "./ISceneClock.js";

export class SceneClock implements ISceneClock {
    private readonly timer: THREE.Timer;

    public constructor() {
        this.timer = new THREE.Timer();
        this.timer.connect(document);
    }

    public update(timestamp?: number): void {
        this.timer.update(timestamp);
    }

    public getDelta(): number {
        return this.timer.getDelta();
    }

    public getElapsedTime(): number {
        return this.timer.getElapsed();
    }
}
