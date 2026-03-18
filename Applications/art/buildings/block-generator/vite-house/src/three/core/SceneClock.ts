import * as THREE from "three";
import type { ISceneClock } from "./ISceneClock";

export class SceneClock implements ISceneClock {
    private readonly clock: THREE.Clock;

    public constructor() {
        this.clock = new THREE.Clock();
    }

    public getDelta(): number {
        return this.clock.getDelta();
    }

    public getElapsedTime(): number {
        return this.clock.getElapsedTime();
    }
}
