import type { ReactiveController, ReactiveControllerHost } from "lit";

import type { CanvasObject } from "../core/canvas-object.js";
import type { CanvasHitTestService } from "../services/canvas-hit-test-service.js";
import type { MouseController } from "./mouse-controller.js";

export class OnDoubleClickController implements ReactiveController {
  private readonly host: ReactiveControllerHost & HTMLElement;
  private readonly hitTestService: CanvasHitTestService;
  private readonly mouseController: MouseController;
  private lastDoubleClickedObject: CanvasObject | null = null;

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

  public get lastTarget(): CanvasObject | null {
    return this.lastDoubleClickedObject;
  }

  public hostConnected(): void {
    this.host.addEventListener("dblclick", this.handleDoubleClick);
  }

  public hostDisconnected(): void {
    this.host.removeEventListener("dblclick", this.handleDoubleClick);
  }

  private readonly handleDoubleClick = (): void => {
    const pointer = this.mouseController.pointer;
    const hit = this.hitTestService.queryTopMost({
      x: pointer.canvasX,
      y: pointer.canvasY,
    });

    if (hit !== null && hit.getCapabilities().doubleClickable === true) {
      this.lastDoubleClickedObject = hit;
    }

    this.host.requestUpdate();
  };
}
