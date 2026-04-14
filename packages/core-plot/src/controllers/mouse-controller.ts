import type { ReactiveController, ReactiveControllerHost } from "lit";

export interface PointerState {
  readonly canvasX: number;
  readonly canvasY: number;
  readonly clientX: number;
  readonly clientY: number;
  readonly isInsideCanvas: boolean;
  readonly primaryButtonDown: boolean;
  readonly buttons: number;
  readonly pointerId: number | null;
}

const initialPointerState: PointerState = {
  canvasX: 0,
  canvasY: 0,
  clientX: 0,
  clientY: 0,
  isInsideCanvas: false,
  primaryButtonDown: false,
  buttons: 0,
  pointerId: null,
};

export class MouseController implements ReactiveController {
  private readonly host: ReactiveControllerHost & HTMLElement;
  private readonly svgProvider: () => SVGSVGElement | null;
  private pointerState: PointerState = initialPointerState;

  public constructor(
    host: ReactiveControllerHost & HTMLElement,
    svgProvider: () => SVGSVGElement | null,
  ) {
    this.host = host;
    this.svgProvider = svgProvider;
    this.host.addController(this);
  }

  public get pointer(): PointerState {
    return this.pointerState;
  }

  public hostConnected(): void {
    this.host.addEventListener("pointerenter", this.handlePointerEnter);
    this.host.addEventListener("pointerleave", this.handlePointerLeave);
    this.host.addEventListener("pointermove", this.handlePointerMove);
    this.host.addEventListener("pointerdown", this.handlePointerDown);
    this.host.addEventListener("pointerup", this.handlePointerUp);
    this.host.addEventListener("pointercancel", this.handlePointerCancel);
  }

  public hostDisconnected(): void {
    this.host.removeEventListener("pointerenter", this.handlePointerEnter);
    this.host.removeEventListener("pointerleave", this.handlePointerLeave);
    this.host.removeEventListener("pointermove", this.handlePointerMove);
    this.host.removeEventListener("pointerdown", this.handlePointerDown);
    this.host.removeEventListener("pointerup", this.handlePointerUp);
    this.host.removeEventListener("pointercancel", this.handlePointerCancel);
  }

  private readonly handlePointerEnter = (event: PointerEvent): void => {
    this.updatePointerState(event, true);
  };

  private readonly handlePointerLeave = (event: PointerEvent): void => {
    this.updatePointerState(event, false);
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    this.updatePointerState(event, true);
  };

  private readonly handlePointerDown = (event: PointerEvent): void => {
    this.host.setPointerCapture?.(event.pointerId);
    this.updatePointerState(event, true);
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    this.updatePointerState(event, true);
  };

  private readonly handlePointerCancel = (event: PointerEvent): void => {
    this.updatePointerState(event, false);
  };

  private updatePointerState(event: PointerEvent, isInsideCanvas: boolean): void {
    const svgPoint = this.toSvgCoordinates(event);

    this.pointerState = {
      canvasX: svgPoint.x,
      canvasY: svgPoint.y,
      clientX: event.clientX,
      clientY: event.clientY,
      isInsideCanvas,
      primaryButtonDown: (event.buttons & 1) === 1,
      buttons: event.buttons,
      pointerId: event.pointerId,
    };

    this.host.requestUpdate();
  }

  private toSvgCoordinates(event: PointerEvent): { x: number; y: number } {
    const svg = this.svgProvider();
    if (svg === null) {
      return { x: 0, y: 0 };
    }

    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;

    const matrix = svg.getScreenCTM();
    if (matrix === null) {
      return { x: 0, y: 0 };
    }

    const transformed = point.matrixTransform(matrix.inverse());
    return { x: transformed.x, y: transformed.y };
  }
}
