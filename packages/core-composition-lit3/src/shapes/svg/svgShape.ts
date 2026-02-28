import { ISvgObject } from "./ISvgObject";
import { svgEl } from "./svg-ns";

export interface SvgRectModel {
  x: number;
  y: number;
  w: number;
  h: number;
  rx?: number;
  ry?: number;
  className?: string;
}

export class SvgRect implements ISvgObject {
  public readonly id: string;

  private readonly model: SvgRectModel;
  private node?: SVGRectElement;

  public constructor(id: string, model: SvgRectModel) {
    this.id = id;
    this.model = model;
  }

  public create(): SVGElement {
    if (this.node) return this.node;

    const rect = svgEl("rect");
    this.node = rect;
    this.update();
    return rect;
  }

  public update(): void {
    if (!this.node) return;

    const { x, y, w, h, rx, ry, className } = this.model;

    // Attributes
    this.node.setAttribute("x", String(x));
    this.node.setAttribute("y", String(y));
    this.node.setAttribute("width", String(w));
    this.node.setAttribute("height", String(h));

    if (rx !== undefined) this.node.setAttribute("rx", String(rx));
    else this.node.removeAttribute("rx");

    if (ry !== undefined) this.node.setAttribute("ry", String(ry));
    else this.node.removeAttribute("ry");

    if (className) this.node.setAttribute("class", className);
    else this.node.removeAttribute("class");
  }

  /** Convenience: mutate model safely then update. */
  public set(next: Partial<SvgRectModel>): void {
    Object.assign(this.model, next);
    this.update();
  }

  public destroy(): void {
    // No listeners in this minimal version.
    // If you add pointer handlers later, remove them here.
    this.node = undefined;
  }
}