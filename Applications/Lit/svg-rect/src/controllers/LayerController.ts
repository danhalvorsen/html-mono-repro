import type { ReactiveController } from "lit";
import type { Host } from "./types.js";

export class LayerController implements ReactiveController {
  private svg?: SVGSVGElement;
  private readonly layers = new Map<string, SVGGElement>();

  public constructor(host: Host) {
    host.addController(this);
  }

  public attach(svg: SVGSVGElement): void {
    if (this.svg === svg) return;
    this.detach();
    this.svg = svg;
  }

  public detach(): void {
    for (const [, g] of this.layers) {
      if (g.isConnected) g.remove();
    }
    this.layers.clear();
    this.svg = undefined;
  }

  public layer(name: string, behindAll = true): SVGGElement {
    const svg = this.requireSvg();
    const key = name;

    const cached = this.layers.get(key);
    if (cached && cached.isConnected) return cached;

    const existing = svg.querySelector<SVGGElement>(`g[data-layer="${CSS.escape(key)}"]`);
    if (existing) {
      existing.setAttribute("pointer-events", "none");
      this.layers.set(key, existing);
      return existing;
    }

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("data-layer", key);
    g.setAttribute("pointer-events", "none");

    if (behindAll) svg.insertBefore(g, svg.firstChild);
    else svg.appendChild(g);

    this.layers.set(key, g);
    return g;
  }

  public remove(name: string): void {
    const svg = this.svg;
    const key = name;

    const cached = this.layers.get(key);
    if (cached?.isConnected) cached.remove();
    this.layers.delete(key);

    svg?.querySelector<SVGGElement>(`g[data-layer="${CSS.escape(key)}"]`)?.remove();
  }

  public viewBox(): { x: number; y: number; width: number; height: number } {
    const vb = this.requireSvg().viewBox.baseVal;
    return { x: vb?.x ?? 0, y: vb?.y ?? 0, width: vb?.width ?? 0, height: vb?.height ?? 0 };
  }

  hostConnected(): void {}

  hostDisconnected(): void {
    this.detach();
  }

  private requireSvg(): SVGSVGElement {
    if (!this.svg) throw new Error("LayerController: call attach(svg) before use.");
    return this.svg;
  }
}