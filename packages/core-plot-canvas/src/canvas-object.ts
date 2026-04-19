import type { TemplateResult } from "lit";
import type { Rectangle2 } from "@monorepo/core-math";
import type { RenderContext } from "./render-context.js";
import { CanvasObjectDragContext } from "./CanvasObjectDragContext.js";
import { InteractionCapabilities } from "./InteractionCapabilities.js";

export interface HitTestContext {
  readonly x: number;
  readonly y: number;
}

export type CanvasObjectBounds = Rectangle2;

let nextCanvasObjectId = 0;

export abstract class CanvasObject {
  public readonly id: string;

  protected constructor(id?: string) {
    this.id = id ?? `canvas-object-${++nextCanvasObjectId}`;
  }

  public getCapabilities(): InteractionCapabilities {
    return {};
  }

  public getBounds(_context: RenderContext): CanvasObjectBounds | null {
    return null;
  }

  public onDragStart(_context: CanvasObjectDragContext): void {}

  public onDragMove(_context: CanvasObjectDragContext): void {}

  public onDragEnd(_context: CanvasObjectDragContext): void {}

  public onDragCancel(_context: CanvasObjectDragContext): void {}

  public abstract render(context: RenderContext): TemplateResult;

  public abstract hitTest(context: HitTestContext): boolean;
}
