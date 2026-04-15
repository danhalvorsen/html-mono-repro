import type { TemplateResult } from "lit";
import type { Rectangle2 } from "@monorepo/core-math";
import type { RenderContext } from "./render-context.js";

export interface HitTestContext {
  readonly x: number;
  readonly y: number;
}

export type CanvasObjectBounds = Rectangle2;

export interface InteractionCapabilities {
  readonly clickable?: boolean;
  readonly draggable?: boolean;
  readonly doubleClickable?: boolean;
  readonly scalable?: boolean;
}

export interface CanvasObjectDragContext {
  readonly startX: number;
  readonly startY: number;
  readonly currentX: number;
  readonly currentY: number;
  readonly deltaX: number;
  readonly deltaY: number;
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
