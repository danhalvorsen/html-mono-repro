// ============================================================================
// src/Pipeline/DragStateStore.ts
// ============================================================================

import { IDragBounds } from "./IDragBounds.js";
import type { DragOperation } from "./DragOperation.js";
import { IDragStateStore } from "./IDragStateStore.js";
import { OnDragMessage } from "../Pipeline/Messages/OnDragMessage.js";

export class DragStateStore implements IDragStateStore {
  private readonly visibleTargetIds = new Set<string>();
  private readonly boundsByTargetId = new Map<string, IDragBounds>();
  private readonly lastOperationByTargetId = new Map<string, DragOperation>();
  private draggingEnabled = true;

  public isDraggingEnabled(): boolean {
    return this.draggingEnabled;
  }

  public enableDragging(): void {
    this.draggingEnabled = true;
  }

  public disableDragging(): void {
    this.draggingEnabled = false;
  }

  public setVisible(targetId: string): void {
    this.visibleTargetIds.add(targetId);
  }

  public setHidden(targetId: string): void {
    this.visibleTargetIds.delete(targetId);
  }

  public isVisible(targetId: string): boolean {
    return this.visibleTargetIds.has(targetId);
  }

  public setBounds(targetId: string, bounds: IDragBounds): void {
    this.boundsByTargetId.set(targetId, bounds);
  }

  public clearBounds(targetId: string): void {
    this.boundsByTargetId.delete(targetId);
  }

  public tryGetBounds(targetId: string): IDragBounds | null {
    return this.boundsByTargetId.get(targetId) ?? null;
  }

  public record(message: OnDragMessage): void {
    const { targetId, operation } = message.payload;
    this.lastOperationByTargetId.set(targetId, operation);
  }

  public getLastOperation(targetId: string): DragOperation | null {
    return this.lastOperationByTargetId.get(targetId) ?? null;
  }
}