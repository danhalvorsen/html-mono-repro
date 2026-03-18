import * as THREE from "three";
import type { IThreeHost } from "./ThreeHost";
import type { IThreeRenderer } from "./IThreeRenderer"

export class ThreeRenderer implements IThreeRenderer {
    private readonly renderer: THREE.WebGLRenderer;

    public constructor(private readonly host: IThreeHost) {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
        });

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.host.attachCanvas(this.renderer.domElement);
    }

    public getRenderer(): THREE.WebGLRenderer {
        return this.renderer;
    }

    public resize(width: number, height: number): void {
        this.renderer.setSize(width, height, false);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    public render(scene: THREE.Scene, camera: THREE.Camera): void {
        this.renderer.render(scene, camera);
    }
}
