// ====================================================================================
// FILE: src/three/core/scene/playgrounds/WindowBuilder.Playground.Scene.ts
// ====================================================================================
import * as THREE from "three";
import { PlaygroundSceneBase } from "../common/PlaygroundSceneBase.js";
import { MaterialToken } from "../../../../core-threejs-app-framework/src/Materials/MaterialToken.js";
import { Window, WindowBuilder } from "../../Builders/IWindowBuilder.js";
export class WindowBuilderPlaygroundScene extends PlaygroundSceneBase {
    constructor(scene, materialFactory) {
        super(scene, "window-builder-playground-root", materialFactory);
    }
    createContent() {
        this.createWall();
        this.createFrontWindows();
    }
    createWall() {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 0.3), this.materialFactory.create(MaterialToken.BuildingWhite));
        wall.position.set(0, 2, 0);
        wall.castShadow = true;
        wall.receiveShadow = true;
        this.addToRoot(wall);
    }
    createFrontWindows() {
        const builder = new WindowBuilder(this.materialFactory);
        const createWindow = () => builder.build(new Window({ rect: { x: 0, y: 0, width: 0.7, height: 2.2 }, material: MaterialToken.BuildingBlue }, { material: MaterialToken.WindowGlassDark, inset: 0.08 }));
        const window1 = createWindow();
        const window2 = createWindow();
        const window3 = createWindow();
        window1.position.set(-2, 2, 0.16);
        window2.position.set(0, 2, 0.16);
        window3.position.set(2, 2, 0.16);
        this.addToRoot(window1, window2, window3);
    }
}
//# sourceMappingURL=WindowBuilder.Playground.Scene.js.map