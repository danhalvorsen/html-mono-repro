import type { ReactiveController, ReactiveControllerHost } from "lit";

export class OnScaleController implements ReactiveController {
  private readonly host: ReactiveControllerHost;
  private scaleFactor = 1;

  public constructor(host: ReactiveControllerHost) {
    this.host = host;
    this.host.addController(this);
  }

  public hostConnected(): void {}

  public hostDisconnected(): void {}

  public get currentScaleFactor(): number {
    return this.scaleFactor;
  }

  public beginScale(deltaY: number): void {
    this.scaleFactor = deltaY < 0 ? 1.1 : 0.9;
    this.host.requestUpdate();
  }
}
