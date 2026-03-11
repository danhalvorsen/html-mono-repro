import type { ReactiveController, ReactiveControllerHost } from "lit";
import type { DragController } from "./DragController.js";

export class MouseController implements ReactiveController {
  private target: EventTarget | null = null;

  public constructor(
    private readonly host: ReactiveControllerHost,
    private readonly drag: DragController,
  ) {
    this.host.addController(this);
  }

  public attach(target: EventTarget): void {
    this.detach();

    this.target = target;
    this.target.addEventListener("mousedown", this.onMouseDown);
    this.target.addEventListener("mousemove", this.onMouseMove);
    this.target.addEventListener("mouseup", this.onMouseUp);
  }

  public detach(): void {
    if (this.target === null) {
      return;
    }

    this.target.removeEventListener("mousedown", this.onMouseDown);
    this.target.removeEventListener("mousemove", this.onMouseMove);
    this.target.removeEventListener("mouseup", this.onMouseUp);
    this.target = null;
  }

  public hostDisconnected(): void {
    this.detach();
  }

  private readonly onMouseDown = (event: Event): void => {
    if (event instanceof MouseEvent) {
      this.drag.onMouseDown(event);
    }
  };

  private readonly onMouseMove = (event: Event): void => {
    if (event instanceof MouseEvent) {
      this.drag.onMouseMove(event);
    }
  };

  private readonly onMouseUp = (event: Event): void => {
    if (event instanceof MouseEvent) {
      this.drag.onMouseUp();
    }
  };
}