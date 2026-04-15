import type { ReactiveController, ReactiveControllerHost } from "lit";

export interface CanvasPoint {
  readonly x: number;
  readonly y: number;
}

export interface SnapResult extends CanvasPoint {
  readonly label?: string;
}

export class SnapController implements ReactiveController {
  private readonly host: ReactiveControllerHost;
  private enabled = true;
  private gridSize = 16;

  public constructor(host: ReactiveControllerHost) {
    this.host = host;
    this.host.addController(this);
  }

  public hostConnected(): void {}

  public hostDisconnected(): void {}

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.host.requestUpdate();
  }

  public setGridSize(gridSize: number): void {
    this.gridSize = gridSize;
    this.host.requestUpdate();
  }

  public snap(point: CanvasPoint): SnapResult {
    if (!this.enabled) {
      return point;
    }

    return {
      x: Math.round(point.x / this.gridSize) * this.gridSize,
      y: Math.round(point.y / this.gridSize) * this.gridSize,
    };
  }
}
