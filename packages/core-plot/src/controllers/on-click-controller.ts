import type { ReactiveController, ReactiveControllerHost } from "lit";

import type { CanvasObject, RenderContext } from "@monorepo/core-plot-canvas";
import type { CanvasHitTestService } from "../services/canvas-hit-test-service.js";
import type { MouseController } from "./mouse-controller.js";

interface PointSelectableCanvasObject extends CanvasObject {
  resolvePointSelectionAt?(point: { x: number; y: number }, context: RenderContext): string | null;
  applyPointSelection?(pointId: string | null): void;
}

export class OnClickController implements ReactiveController {
  private readonly host: ReactiveControllerHost & HTMLElement;
  private readonly hitTestService: CanvasHitTestService;
  private readonly mouseController: MouseController;
  private readonly renderContextProvider: () => RenderContext;
  private selectedObject: CanvasObject | null = null;
  private selectedPointId: string | null = null;

  public constructor(
    host: ReactiveControllerHost & HTMLElement,
    hitTestService: CanvasHitTestService,
    mouseController: MouseController,
    renderContextProvider: () => RenderContext,
  ) {
    this.host = host;
    this.hitTestService = hitTestService;
    this.mouseController = mouseController;
    this.renderContextProvider = renderContextProvider;
    this.host.addController(this);
  }

  public get selection(): CanvasObject | null {
    return this.selectedObject;
  }

  public get selectedPoint(): string | null {
    return this.selectedPointId;
  }

  public hostConnected(): void {
    this.host.addEventListener("click", this.handleClick);
  }

  public hostDisconnected(): void {
    this.host.removeEventListener("click", this.handleClick);
  }

  private readonly handleClick = (): void => {
    const pointer = this.mouseController.pointer;
    const previousSelection = this.selectedObject as PointSelectableCanvasObject | null;
    const hit = this.hitTestService.queryTopMost({
      x: pointer.canvasX,
      y: pointer.canvasY,
    });

    previousSelection?.applyPointSelection?.(null);

    if (hit !== null && hit.getCapabilities().clickable === true) {
      this.selectedObject = hit;
      this.selectedPointId = (hit as PointSelectableCanvasObject).resolvePointSelectionAt?.(
        { x: pointer.canvasX, y: pointer.canvasY },
        this.renderContextProvider(),
      ) ?? null;
      (hit as PointSelectableCanvasObject).applyPointSelection?.(this.selectedPointId);
    } else {
      this.selectedObject = null;
      this.selectedPointId = null;
    }

    this.host.requestUpdate();
  };
}
