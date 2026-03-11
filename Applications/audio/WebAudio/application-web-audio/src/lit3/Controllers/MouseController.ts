import type { ReactiveController, ReactiveControllerHost } from "lit";

export class MouseController implements ReactiveController {

  private host: ReactiveControllerHost;
  private target: EventTarget | null = null;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  attach(target: EventTarget) {
    this.target = target;

    target.addEventListener("mousedown", this.onMouse);
    target.addEventListener("mousemove", this.onMouse);
    target.addEventListener("mouseup", this.onMouse);
  }

  detach() {
    if (!this.target) return;

    this.target.removeEventListener("mousedown", this.onMouse);
    this.target.removeEventListener("mousemove", this.onMouse);
    this.target.removeEventListener("mouseup", this.onMouse);

    this.target = null;
  }

  hostDisconnected() {
    this.detach();
  }

  private onMouse = (event: Event) => {

    if (!(event instanceof MouseEvent)) return;

    const host = this.host as unknown as {
      mouseEvent?: (event: MouseEvent) => void;
    };

    host.mouseEvent?.(event);
  };
}