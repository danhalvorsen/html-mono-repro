import { MouseController } from "../controllers/MouseController.js";

import type { Host } from "../controllers/types.js";
import { LayerController } from "../controllers/LayerController.js";
import { GridController } from "../controllers/GridController.js";
import { CANVAS_GEOMETRY_EVENT } from "../events/canvas-events.js";
 
export type Pt = { x: number; y: number };

export class SvgCanvas extends EventTarget {
  public readonly layers: LayerController;
  public readonly grid: GridController;
  private readonly mouse: MouseController;

  public constructor(host: Host, public readonly el: SVGSVGElement) {
    super();

    // single owner for pointer behavior
    this.el.style.touchAction = "none";

    this.layers = new LayerController(host);
    this.layers.attach(el);

    this.grid = new GridController(host, this);

    this.mouse = new MouseController(host);
    this.mouse.attach(this);
  }

  public beginPointer(e: PointerEvent): void {
    this.mouse.begin(e);
  }

  public dispose(): void {
    this.mouse.detach();
  }

  public viewBox(): Readonly<{ x: number; y: number; width: number; height: number }> {
    const vb = this.el.viewBox.baseVal;
    return { x: vb?.x ?? 0, y: vb?.y ?? 0, width: vb?.width ?? 0, height: vb?.height ?? 0 };
  }

  /** Viewport in CSS pixels (what user sees). */
  public viewport(): Readonly<{ width: number; height: number }> {
    const r = this.el.getBoundingClientRect();
    return { width: Math.round(r.width), height: Math.round(r.height) };
  }

  public toSvgPoint(e: PointerEvent): Pt {
    const pt = this.el.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    const ctm = this.el.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };

    const sp = pt.matrixTransform(ctm.inverse());
    return { x: sp.x, y: sp.y };
  }

  /** Align viewBox to viewport and notify grid/others. Call from firstUpdated() and on resize. */
  public syncViewBoxToViewport(): void {
    const r = this.el.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width));
    const h = Math.max(1, Math.round(r.height));

    const vb = this.el.viewBox.baseVal;
    const same =
      vb.x === 0 &&
      vb.y === 0 &&
      Math.round(vb.width) === w &&
      Math.round(vb.height) === h;

    if (!same) this.el.setAttribute("viewBox", `0 0 ${w} ${h}`);

    this.dispatchEvent(new Event(CANVAS_GEOMETRY_EVENT));
  }
}