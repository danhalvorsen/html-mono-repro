import type { ReactiveController, ReactiveControllerHost } from "lit";
import type { IDraggable } from "../WebComponents/IDraggable.js";
import { MouseController } from "./MouseController.js";

type Point = Readonly<{
  x: number;
  y: number;
}>;

export class DragController implements ReactiveController {
  private readonly host: ReactiveControllerHost;
  private readonly mouse: MouseController;
  private readonly documentRef: Document;

  private active: IDraggable | null = null;
  private lastPointerPosition: Point | null = null;
  private isConnected = false;

  public constructor(
    host: ReactiveControllerHost,
    mouse: MouseController,
    documentRef: Document = document,
  ) {
    this.host = host;
    this.mouse = mouse;
    this.documentRef = documentRef;

    this.host.addController(this);
  }

  public hostConnected(): void {
    if (this.isConnected) {
      return;
    }

    this.documentRef.addEventListener("mousemove", this.onMove);
    this.documentRef.addEventListener("mouseup", this.onUp);

    this.isConnected = true;
  }

  public hostDisconnected(): void {
    if (!this.isConnected) {
      return;
    }

    this.documentRef.removeEventListener("mousemove", this.onMove);
    this.documentRef.removeEventListener("mouseup", this.onUp);

    this.isConnected = false;
    this.cancelDrag();
  }

  public startDrag(target: IDraggable, x: number, y: number): void {
    this.active = target;
    this.lastPointerPosition = { x, y };
  }

  public cancelDrag(): void {
    this.active = null;
    this.lastPointerPosition = null;
  }

  private readonly onMove = (event: MouseEvent): void => {
    if (this.active === null || this.lastPointerPosition === null) {
      return;
    }

    const currentPointerPosition: Point = {
      x: event.clientX,
      y: event.clientY,
    };

    const dx = currentPointerPosition.x - this.lastPointerPosition.x;
    const dy = currentPointerPosition.y - this.lastPointerPosition.y;

    if (dx === 0 && dy === 0) {
      return;
    }

    const position = this.active.getPosition();

    this.active.setPosition({
      x: position.x + dx,
      y: position.y + dy,
    });

    this.lastPointerPosition = currentPointerPosition;
    this.host.requestUpdate();
  };

  private readonly onUp = (): void => {
    this.cancelDrag();
  };
}
