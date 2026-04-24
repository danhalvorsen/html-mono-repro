// ====================================================================================
// FILE: OrbitCameraController.ts
// ====================================================================================
 
import type { IInteractiveCameraController } from "./IInteractiveCameraController.js";
import type { IThreeCamera } from "./IThreeCamera.js";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class OrbitCameraController implements IInteractiveCameraController {
  private readonly controls: OrbitControls;
  private readonly domElement: HTMLElement;

  public constructor(
    camera: IThreeCamera,
    domElement: HTMLElement,
  ) {
    this.domElement = domElement;
    this.controls = new OrbitControls(
      camera.getCamera(),
      domElement,
    );

    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;

    this.controls.target.set(0, 4, 0);
    this.controls.update();
  }

  public connect(): void {
    this.controls.connect();
  }

  public disconnect(): void {
    this.controls.dispose();
  }

  public update(): void {
    this.controls.update();
  }
}
