import type {
  IMouseController,
  IReactiveController,
  IReactiveHost
} from "@monorepo/core-reactive-abstract";
import type { Handle, MouseDragMove, RectModel } from "../drag/Types.js";

export class ScaleController implements IReactiveController<IReactiveHost<unknown>> {
  private scaling = false;
  private handle: Handle = "se";
  private r0 = { x: 0, y: 0, w: 0, h: 0 };

  private unsubscribeStart?: () => void;
  private unsubscribeMove?: () => void;
  private unsubscribeEnd?: () => void;

  public constructor(
    private readonly host: IReactiveHost<unknown>,
    private readonly mouse: IMouseController,
    private readonly rect: RectModel,
    private readonly minSize = 8
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

  public beginScale(handle: Handle): void {
    this.scaling = true;
    this.handle = handle;
  }

  private start(): void {
    if (!this.scaling) {
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
    if (!this.scaling) {
      return;
    }

    const { dx, dy } = move;

    let x = this.r0.x;
    let y = this.r0.y;
    let w = this.r0.w;
    let h = this.r0.h;

    const ox2 = this.r0.x + this.r0.w;
    const oy2 = this.r0.y + this.r0.h;

    switch (this.handle) {
      case "nw":
        x = this.r0.x + dx;
        y = this.r0.y + dy;
        w = this.r0.w - dx;
        h = this.r0.h - dy;
        break;

      case "ne":
        y = this.r0.y + dy;
        w = this.r0.w + dx;
        h = this.r0.h - dy;
        break;

      case "se":
        w = this.r0.w + dx;
        h = this.r0.h + dy;
        break;

      case "sw":
        x = this.r0.x + dx;
        w = this.r0.w - dx;
        h = this.r0.h + dy;
        break;
    }

    w = Math.max(this.minSize, w);
    h = Math.max(this.minSize, h);

    switch (this.handle) {
      case "nw":
        x = ox2 - w;
        y = oy2 - h;
        break;

      case "ne":
        x = this.r0.x;
        y = oy2 - h;
        break;

      case "se":
        x = this.r0.x;
        y = this.r0.y;
        break;

      case "sw":
        x = ox2 - w;
        y = this.r0.y;
        break;
    }

    this.rect.x = x;
    this.rect.y = y;
    this.rect.w = w;
    this.rect.h = h;

    this.host.requestUpdate();
  }

  private end(): void {
    if (!this.scaling) {
      return;
    }

    this.scaling = false;
    this.host.requestUpdate();
  }
}