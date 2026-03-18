import * as THREE from "three";
import type { IThreeCamera } from "./IThreeCamera";
 
export class ThreeCamera implements IThreeCamera {
    private readonly camera: THREE.PerspectiveCamera;

    public constructor() {
        this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2000);
        this.camera.position.set(22, 18, 22);
        this.camera.lookAt(0, 5, 0);
    }

    public getCamera(): THREE.PerspectiveCamera {
        return this.camera;
    }

    public resize(width: number, height: number): void {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
}
