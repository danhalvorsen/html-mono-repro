import type { TemplateResult } from "lit";

import type { RenderContext } from "./render-context.js";

export interface HitTestContext {
  readonly x: number;
  readonly y: number;
}

export interface InteractionCapabilities {
  readonly clickable?: boolean;
  readonly draggable?: boolean;
  readonly doubleClickable?: boolean;
  readonly scalable?: boolean;
}

let nextCanvasObjectId = 0;

export abstract class CanvasObject {
  public readonly id: string;

  protected constructor(id?: string) {
    this.id = id ?? `canvas-object-${++nextCanvasObjectId}`;
  }

  public getCapabilities(): InteractionCapabilities {
    return {};
  }

  public abstract render(context: RenderContext): TemplateResult;

  public abstract hitTest(context: HitTestContext): boolean;
}
