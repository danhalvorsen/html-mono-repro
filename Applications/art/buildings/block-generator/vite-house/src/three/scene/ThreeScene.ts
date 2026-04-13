import * as THREE from "three";
import type { IThreeScene } from "./IThreeScene.js";
 
export class ThreeScene implements IThreeScene {
    private readonly scene: THREE.Scene;

    public constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xd9e6f2);
    }

    public getScene(): THREE.Scene {
        return this.scene;
    }
}
