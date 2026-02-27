// SvgElement.ts
const NS = "http://www.w3.org/2000/svg";

export abstract class SvgElement<T extends SVGElement> {
  readonly el: T;

  protected constructor(tagName: string) {
    this.el = document.createElementNS(NS, tagName) as T;
  }

  // ---- attributes ----
  attr(name: string, value: string | number | boolean | null | undefined): this {
    if (value === null || value === undefined) return this;
    this.el.setAttribute(name, String(value));
    return this;
  }

  // Common convenience (optional but tiny)
  stroke(v: string): this { return this.attr("stroke", v); }
  fill(v: string): this { return this.attr("fill", v); }
  opacity(v: number): this { return this.attr("opacity", v); }
  width(v: number): this { return this.attr("stroke-width", v); }

  // ---- composition ----
  appendTo(parent: SVGElement): this {
    parent.appendChild(this.el);
    return this;
  }

  remove(): void {
    this.el.remove();
  }

  // ---- utility ----
  pointerEvents(enabled: boolean): this {
    return this.attr("pointer-events", enabled ? "auto" : "none");
  }
}