import type { ReactiveControllerHost } from "lit";

export class RectModel {
  public x = 20;
  public y = 20;
  public w = 80;
  public h = 60;
}

export type Host = ReactiveControllerHost & EventTarget;
export type Handle = "nw" | "ne" | "se" | "sw";

// Added: small surface port (MVP)
export type ViewBox = Readonly<{ x: number; y: number; width: number; height: number }>;
export type Viewport = Readonly<{ width: number; height: number }>;

export type CanvasSurface = Readonly<{
  layers: {
    layer(name: string, behindAll?: boolean): SVGGElement;
    remove(name: string): void;
  };
  viewBox(): ViewBox;
  viewport(): Viewport;
}>;