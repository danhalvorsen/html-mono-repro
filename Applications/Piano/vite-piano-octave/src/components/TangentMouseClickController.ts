import type { ReactiveController, ReactiveControllerHost } from "lit";
import type { Tangent } from "./tangent";

export class TangentMouseClickController implements ReactiveController {
  private readonly host: ReactiveControllerHost & Tangent;
  private pressedTimer: number | null = null;
  private readonly onClick = () => {
    this.host.pressed = true;
    if (this.pressedTimer !== null) {
      window.clearTimeout(this.pressedTimer);
    }
    this.pressedTimer = window.setTimeout(() => {
      this.host.pressed = false;
      this.pressedTimer = null;
    }, 500);

    this.host.dispatchEvent(
      new CustomEvent("tangent-click", {
        detail: {
          tangentId: this.host.tangentId,
          note: this.host.note
        },
        bubbles: true,
        composed: true
      })
    );
  };

  constructor(host: ReactiveControllerHost & Tangent) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    this.host.addEventListener("click", this.onClick);
  }

  hostDisconnected(): void {
    this.host.removeEventListener("click", this.onClick);
    if (this.pressedTimer !== null) {
      window.clearTimeout(this.pressedTimer);
      this.pressedTimer = null;
    }
  }
}
