import type { ReactiveController, ReactiveControllerHost } from "lit";

import type { GraphPointerListener } from "../GraphElementControllers.js";

export class ReactiveMouseController implements ReactiveController {
  private readonly pointerMoveListeners = new Set<GraphPointerListener>();
  private readonly pointerUpListeners = new Set<GraphPointerListener>();
  private connected = false;

  private readonly onPointerMove = (event: PointerEvent): void => {
    this.pointerMoveListeners.forEach((listener) => listener(event));
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    this.pointerUpListeners.forEach((listener) => listener(event));
  };

  constructor(
    private readonly host: ReactiveControllerHost,
    private target: EventTarget = window,
  ) {
    this.host.addController(this);
  }

  setTarget(nextTarget: EventTarget): void {
    if (this.target === nextTarget) {
      return;
    }

    if (this.connected) {
      this.detachListeners();
      this.target = nextTarget;
      this.attachListeners();
      return;
    }

    this.target = nextTarget;
  }

  hostConnected(): void {
    this.connected = true;
    this.attachListeners();
  }

  hostDisconnected(): void {
    this.connected = false;
    this.detachListeners();
    this.pointerMoveListeners.clear();
    this.pointerUpListeners.clear();
  }

  subscribePointerMove(listener: GraphPointerListener): () => void {
    this.pointerMoveListeners.add(listener);

    return () => {
      this.pointerMoveListeners.delete(listener);
    };
  }

  subscribePointerUp(listener: GraphPointerListener): () => void {
    this.pointerUpListeners.add(listener);

    return () => {
      this.pointerUpListeners.delete(listener);
    };
  }

  private attachListeners(): void {
    this.target.addEventListener("pointermove", this.onPointerMove as EventListener, { passive: true });
    this.target.addEventListener("pointerup", this.onPointerUp as EventListener, { passive: true });
  }

  private detachListeners(): void {
    this.target.removeEventListener("pointermove", this.onPointerMove as EventListener);
    this.target.removeEventListener("pointerup", this.onPointerUp as EventListener);
  }
}
