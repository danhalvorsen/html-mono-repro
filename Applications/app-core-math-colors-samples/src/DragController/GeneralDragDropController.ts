// GeneralDragDropController.ts
import type { ReactiveController, ReactiveControllerHost } from "lit";
import type { IDragDropController } from "./IDragDropController.js";
import type { IDragDropHandler } from "./IDragDropHandler.js";
import type { Point } from "@monorepo/core-math";
import { DragSession } from "./DragSession.js";

export class GeneralDragDropController<TTarget>
  implements ReactiveController, IDragDropController
{
  private readonly _host: ReactiveControllerHost;
  private readonly _handler: IDragDropHandler<TTarget>;

  private _activePointerId: number | null = null;
  private _session: DragSession<TTarget> | null = null;
  private _dragStarted = false;

  public constructor(
    host: ReactiveControllerHost,
    handler: IDragDropHandler<TTarget>,
  ) {
    this._host = host;
    this._handler = handler;

    host.addController(this);
  }

  public hostConnected(): void {
    window.addEventListener("pointermove", this.onMove);
    window.addEventListener("pointerup", this.onUp);
    window.addEventListener("pointercancel", this.onCancel);
  }

  public hostDisconnected(): void {
    window.removeEventListener("pointermove", this.onMove);
    window.removeEventListener("pointerup", this.onUp);
    window.removeEventListener("pointercancel", this.onCancel);
  }

  public onPointerDown(event: PointerEvent): void {
    if (this._activePointerId !== null) return;

    const position = this.toPoint(event);
    const target = this._handler.resolveTarget(position, event);

    if (!target) return;

    this._activePointerId = event.pointerId;
    this._session = new DragSession(target, position, position);
    this._dragStarted = false;
  }

  public onClick(event: MouseEvent): void {
    if (this._dragStarted) return;

    const position = this.toPoint(event);
    const target = this._handler.resolveTarget(
      position,
      event as unknown as PointerEvent,
    );

    if (!target) return;

    this._handler.onClick(target, position, event);
  }

  private readonly onMove = (event: PointerEvent): void => {
    if (!this.isActive(event) || !this._session) return;

    this._session = this._session.moveTo(this.toPoint(event));

    if (!this._dragStarted) {
      this._dragStarted = true;
      this._handler.onDragStart(this._session, event);
    } else {
      this._handler.onDragMove(this._session, event);
    }

    this._host.requestUpdate();
  };

  private readonly onUp = (event: PointerEvent): void => {
    if (!this.isActive(event) || !this._session) return;

    this._session = this._session.moveTo(this.toPoint(event));

    if (this._dragStarted) {
      this._handler.onDragEnd(this._session, event);
    }

    this.reset();
    this._host.requestUpdate();
  };

  private readonly onCancel = (event: PointerEvent): void => {
    if (!this.isActive(event) || !this._session) return;

    this._session = this._session.moveTo(this.toPoint(event));

    if (this._dragStarted) {
      this._handler.onDragEnd(this._session, event);
    }

    this.reset();
    this._host.requestUpdate();
  };

  private isActive(event: PointerEvent): boolean {
    return this._activePointerId === event.pointerId;
  }

  private reset(): void {
    this._activePointerId = null;
    this._session = null;
    this._dragStarted = false;
  }

  private toPoint(event: MouseEvent | PointerEvent): Point {
    return {
      x: event.clientX,
      y: event.clientY,
    };
  }
}