// --------------------------------------------------------------------------
// Drag controller
// --------------------------------------------------------------------------

import type {
  IMouseController,
  IReactiveController,
  IReactiveHost
} from "@monorepo/core-reactive-abstract";
import type { MouseDragMove, RectModel } from "./Types.js";

export class DragController implements IReactiveController<IReactiveHost<unknown>> {
  private dragging = false;
  private r0 = { x: 0, y: 0, w: 0, h: 0 };

  private unsubscribeStart?: () => void;
  private unsubscribeMove?: () => void;
  private unsubscribeEnd?: () => void;

  public constructor(
    private readonly host: IReactiveHost<unknown>,
    private readonly mouse: IMouseController,
    private readonly rect: RectModel
  ) {
    this.host.addController(this);
  }

  public hostConnected(): void {
    this.unsubscribeStart = this.mouse.onStart(() => this.start());
    this.unsubscribeMove = this.mouse.onMove((move) => this.move(move));
    this.unsubscribeEnd = this.mouse.onEnd(() => this.end());
  }

  public hostDisconnected(): void {
    this.unsubscribeStart?.();
    this.unsubscribeMove?.();
    this.unsubscribeEnd?.();
  }

  public beginDrag(): void {
    this.dragging = true;
  }

  private start(): void {
    if (!this.dragging) {
      return;
    }

    this.r0 = {
      x: this.rect.x,
      y: this.rect.y,
      w: this.rect.w,
      h: this.rect.h,
    };
  }

  private move(move: MouseDragMove): void {
    if (!this.dragging) {
      return;
    }

    this.rect.x = this.r0.x + move.dx;
    this.rect.y = this.r0.y + move.dy;

    this.host.requestUpdate();
  }

  private end(): void {
    if (!this.dragging) {
      return;
    }

    this.dragging = false;
    this.host.requestUpdate();
  }
}