import type { ReactiveController, ReactiveControllerHost } from "lit";

import type { CanvasObjectRegistry } from "../core/canvas-object-registry.js";
import type { CanvasObject } from "../core/canvas-object.js";
import type { MouseController } from "./mouse-controller.js";

export class OnDoubleClickController implements ReactiveController {
  private readonly host: ReactiveControllerHost & HTMLElement;
  private readonly registry: CanvasObjectRegistry;
  private readonly mouseController: MouseController;
  private lastDoubleClickedObject: CanvasObject | null = null;

  public constructor(
    host: ReactiveControllerHost & HTMLElement,
    registry: CanvasObjectRegistry,
    mouseController: MouseController,
  ) {
    this.host = host;
    this.registry = registry;
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
    const hit = this.registry.hitTestTopMost({
      x: pointer.canvasX,
      y: pointer.canvasY,
    });

    if (hit !== null && hit.getCapabilities().doubleClickable === true) {
      this.lastDoubleClickedObject = hit;
    }

    this.host.requestUpdate();
  };
}
