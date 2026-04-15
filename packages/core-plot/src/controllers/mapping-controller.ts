import type { ReactiveController, ReactiveControllerHost } from "lit";
import { AxisRange } from "../coordinates/axis-range.js";

export interface CartesianPoint {
  readonly x: number;
  readonly y: number;
}

export interface MappingViewport {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export class MappingController implements ReactiveController {
  private readonly host: ReactiveControllerHost;

  public constructor(host: ReactiveControllerHost) {
    this.host = host;
    this.host.addController(this);
  }

  public hostConnected(): void {}

  public hostDisconnected(): void {}

  public mapToSvg(
    point: CartesianPoint,
    xRange: AxisRange,
    yRange: AxisRange,
    viewport: MappingViewport,
  ): CartesianPoint {
    const normalizedX = (point.x - xRange.min) / xRange.span();
    const normalizedY = (point.y - yRange.min) / yRange.span();

    return {
      x: viewport.left + normalizedX * viewport.width,
      y: viewport.top + viewport.height - normalizedY * viewport.height,
    };
  }

  public mapToCartesian(
    point: CartesianPoint,
    xRange: AxisRange,
    yRange: AxisRange,
    viewport: MappingViewport,
  ): CartesianPoint {
    const normalizedX = (point.x - viewport.left) / viewport.width;
    const normalizedY = 1 - (point.y - viewport.top) / viewport.height;

    return {
      x: xRange.min + normalizedX * xRange.span(),
      y: yRange.min + normalizedY * yRange.span(),
    };
  }
}
