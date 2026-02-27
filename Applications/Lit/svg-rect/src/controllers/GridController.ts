import type { ReactiveController } from "lit";
import type { Host } from "./types.js";
import type { SvgCanvas } from "../svgs/SvgCanvas.js";

import { LineSvg } from "../svgs/LineSvg.js";
import { CANVAS_GEOMETRY_EVENT } from "../events/canvas-events.js";

export class GridController implements ReactiveController {
  private enabled = true;
  private size = 10;
  private majorEvery = 5;
  private readonly layerName = "grid";

  private readonly onGeom = () => this.render();

  public constructor(
    private readonly host: Host,
    private readonly canvas: SvgCanvas
  ) {
    host.addController(this);
  }

  hostConnected(): void {
    this.canvas.addEventListener(CANVAS_GEOMETRY_EVENT, this.onGeom);
    this.render();
  }

  hostDisconnected(): void {
    this.canvas.removeEventListener(CANVAS_GEOMETRY_EVENT, this.onGeom);
  }

  public setEnabled(v: boolean): void {
    if (this.enabled === v) return;
    this.enabled = v;
    this.render();
    this.host.requestUpdate();
  }

  private mod(n: number, m: number): number {
    return ((n % m) + m) % m;
  }

  public render(): void {
    if (!this.enabled) {
      this.canvas.layers.remove(this.layerName);
      return;
    }

    // Required: grid reads viewport size from canvas
    const vp = this.canvas.viewport();
    if (vp.width <= 0 || vp.height <= 0) return;

    const vb = this.canvas.viewBox();
    const g = this.canvas.layers.layer(this.layerName, true);
    g.replaceChildren();

    const x0 = vb.x, y0 = vb.y, x1 = vb.x + vb.width, y1 = vb.y + vb.height;
    const step = this.size;

    const startX = Math.floor(x0 / step) * step;
    const startY = Math.floor(y0 / step) * step;

    for (let x = startX; x <= x1; x += step) {
      const idx = Math.floor(x / step);
      const major = this.mod(idx, this.majorEvery) === 0;
      const line = new LineSvg(x, y0, x, y1);
      (major ? line.major() : line.minor()).appendTo(g);
    }

    for (let y = startY; y <= y1; y += step) {
      const idx = Math.floor(y / step);
      const major = this.mod(idx, this.majorEvery) === 0;
      const line = new LineSvg(x0, y, x1, y);
      (major ? line.major() : line.minor()).appendTo(g);
    }
  }
}