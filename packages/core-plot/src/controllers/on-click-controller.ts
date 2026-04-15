import type { ReactiveController, ReactiveControllerHost } from "lit";

import type { CanvasObject } from "../core/canvas-object.js";
import type { CanvasHitTestService } from "../services/canvas-hit-test-service.js";
import type { MouseController } from "./mouse-controller.js";

export class OnClickController implements ReactiveController {
  private readonly host: ReactiveControllerHost & HTMLElement;
  private readonly hitTestService: CanvasHitTestService;
  private readonly mouseController: MouseController;
  private selectedObject: CanvasObject | null = null;

  public constructor(
    host: ReactiveControllerHost & HTMLElement,
    hitTestService: CanvasHitTestService,
    mouseController: MouseController,
  ) {
    this.host = host;
    this.hitTestService = hitTestService;
    this.mouseController = mouseController;
    this.host.addController(this);
  }

  public get selection(): CanvasObject | null {
    return this.selectedObject;
  }

  public hostConnected(): void {
    this.host.addEventListener("click", this.handleClick);
  }

  public hostDisconnected(): void {
    this.host.removeEventListener("click", this.handleClick);
  }

  private readonly handleClick = (): void => {
    const pointer = this.mouseController.pointer;
    const hit = this.hitTestService.queryTopMost({
      x: pointer.canvasX,
      y: pointer.canvasY,
    });

    if (hit !== null && hit.getCapabilities().clickable === true) {
      this.selectedObject = hit;
    } else {
      this.selectedObject = null;
    }

    this.host.requestUpdate();
  };
}
