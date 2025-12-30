import { ICommonEvent } from "../types/common/common-event.js";
import {
  IDragEndData,
  IDragMoveData,
  IDragStartData,
  IDragEnterData,
  IDragLeaveData,
  IDragOverData,
  IDropData
} from "../types/drag/drag-contracts.js";
import { defineEventName, EventName } from "../types/common/event-name.js";

type DragHandlerMap = {
  start: (e: ICommonEvent<IDragStartData>) => void;
  move: (e: ICommonEvent<IDragMoveData>) => void;
  end: (e: ICommonEvent<IDragEndData>) => void;
  enter: (e: ICommonEvent<IDragEnterData>) => void;
  leave: (e: ICommonEvent<IDragLeaveData>) => void;
  over: (e: ICommonEvent<IDragOverData>) => void;
  drop: (e: ICommonEvent<IDropData>) => void;
};
type DragEventType = keyof DragHandlerMap;

class HandlerRegistry {
  private readonly buckets: {
    [K in keyof DragHandlerMap]: Set<DragHandlerMap[K]>;
  } = {
    start: new Set(),
    move: new Set(),
    end: new Set(),
    enter: new Set(),
    leave: new Set(),
    over: new Set(),
    drop: new Set()
  };

  on(type: "start", handler: DragHandlerMap["start"]): void;
  on(type: "move", handler: DragHandlerMap["move"]): void;
  on(type: "end", handler: DragHandlerMap["end"]): void;
  on(type: "enter", handler: DragHandlerMap["enter"]): void;
  on(type: "leave", handler: DragHandlerMap["leave"]): void;
  on(type: "over", handler: DragHandlerMap["over"]): void;
  on(type: "drop", handler: DragHandlerMap["drop"]): void;
  on(type: DragEventType, handler: DragHandlerMap[DragEventType]): void {
    this.buckets[type].add(handler as never);
  }

  off(type: "start", handler: DragHandlerMap["start"]): void;
  off(type: "move", handler: DragHandlerMap["move"]): void;
  off(type: "end", handler: DragHandlerMap["end"]): void;
  off(type: "enter", handler: DragHandlerMap["enter"]): void;
  off(type: "leave", handler: DragHandlerMap["leave"]): void;
  off(type: "over", handler: DragHandlerMap["over"]): void;
  off(type: "drop", handler: DragHandlerMap["drop"]): void;
  off(type: DragEventType, handler: DragHandlerMap[DragEventType]): void {
    this.buckets[type].delete(handler as never);
  }

  emit(type: "start", evt: ICommonEvent<IDragStartData>): void;
  emit(type: "move", evt: ICommonEvent<IDragMoveData>): void;
  emit(type: "end", evt: ICommonEvent<IDragEndData>): void;
  emit(type: "enter", evt: ICommonEvent<IDragEnterData>): void;
  emit(type: "leave", evt: ICommonEvent<IDragLeaveData>): void;
  emit(type: "over", evt: ICommonEvent<IDragOverData>): void;
  emit(type: "drop", evt: ICommonEvent<IDropData>): void;
  emit(type: DragEventType, evt: ICommonEvent<any>): void {
    const bucket = this.buckets[type] as Set<(e: ICommonEvent<any>) => void>;
    for (const h of bucket) {
      try {
        h(evt);
      } catch (err) {
        console.error(`Error in drag ${String(type)} handler`, err);
      }
    }
  }
}

export namespace Drag {
 
  export interface IDragController {
    onDragStart(
      handler: (evt: ICommonEvent<IDragStartData>) => void
    ): void;

    onDragMove(
      handler: (evt: ICommonEvent<IDragMoveData>) => void
    ): void;

    onDragEnd(
      handler: (evt: ICommonEvent<IDragEndData>) => void
    ): void;

    onDragEnter?(
      handler: (evt: ICommonEvent<IDragEnterData>) => void
    ): void;

    onDragLeave?(
      handler: (evt: ICommonEvent<IDragLeaveData>) => void
    ): void;

    onDragOver?(
      handler: (evt: ICommonEvent<IDragOverData>) => void
    ): void;

    onDrop?(
      handler: (evt: ICommonEvent<IDropData>) => void
    ): void;

    dispose(): void;
  }

  export const dragTypes = {
    DRAG_START: "DRAG_START",
    DRAG_MOVE: "DRAG_MOVE",
    DRAG_END: "DRAG_END",
    DRAG_ENTER: "DRAG_ENTER",
    DRAG_LEAVE: "DRAG_LEAVE",
    DRAG_OVER: "DRAG_OVER",
    DRAG_DROP: "DRAG_DROP",
    DRAG_MOVE_EVENT: "DRAG_MOVE_EVENT"
  } as const;

  export type DragType = (typeof dragTypes)[keyof typeof dragTypes];

  export const DragEvents: Record<DragType, EventName> = {
    DRAG_START: defineEventName("drag:start"),
    DRAG_MOVE: defineEventName("drag:move"),
    DRAG_END: defineEventName("drag:end"),
    DRAG_ENTER: defineEventName("drag:enter"),
    DRAG_LEAVE: defineEventName("drag:leave"),
    DRAG_OVER: defineEventName("drag:over"),
    DRAG_DROP: defineEventName("drag:drop"),
    DRAG_MOVE_EVENT: defineEventName("app:drag:move")
  };

  export const DRAG_START = DragEvents.DRAG_START;
  export const DRAG_MOVE = DragEvents.DRAG_MOVE;
  export const DRAG_END = DragEvents.DRAG_END;
  export const DRAG_ENTER = DragEvents.DRAG_ENTER;
  export const DRAG_LEAVE = DragEvents.DRAG_LEAVE;
  export const DRAG_OVER = DragEvents.DRAG_OVER;
  export const DRAG_DROP = DragEvents.DRAG_DROP;
  export const DRAG_MOVE_EVENT: EventName = DragEvents.DRAG_MOVE_EVENT;
}

export abstract class BaseDragController implements Drag.IDragController {
  private readonly registry = new HandlerRegistry();

  onDragStart(handler: (evt: ICommonEvent<IDragStartData>) => void): void {
    this.registry.on("start", handler);
  }

  onDragMove(handler: (evt: ICommonEvent<IDragMoveData>) => void): void {
    this.registry.on("move", handler);
  }

  onDragEnd(handler: (evt: ICommonEvent<IDragEndData>) => void): void {
    this.registry.on("end", handler);
  }

  onDragEnter(handler: (evt: ICommonEvent<IDragEnterData>) => void): void {
    this.registry.on("enter", handler);
  }

  onDragLeave(handler: (evt: ICommonEvent<IDragLeaveData>) => void): void {
    this.registry.on("leave", handler);
  }

  onDragOver(handler: (evt: ICommonEvent<IDragOverData>) => void): void {
    this.registry.on("over", handler);
  }

  onDrop(handler: (evt: ICommonEvent<IDropData>) => void): void {
    this.registry.on("drop", handler);
  }

  protected emitStart(evt: ICommonEvent<IDragStartData>): void {
    this.registry.emit("start", evt);
  }

  protected emitMove(evt: ICommonEvent<IDragMoveData>): void {
    this.registry.emit("move", evt);
  }

  protected emitEnd(evt: ICommonEvent<IDragEndData>): void {
    this.registry.emit("end", evt);
  }

  protected emitEnter(evt: ICommonEvent<IDragEnterData>): void {
    this.registry.emit("enter", evt);
  }

  protected emitLeave(evt: ICommonEvent<IDragLeaveData>): void {
    this.registry.emit("leave", evt);
  }

  protected emitOver(evt: ICommonEvent<IDragOverData>): void {
    this.registry.emit("over", evt);
  }

  protected emitDrop(evt: ICommonEvent<IDropData>): void {
    this.registry.emit("drop", evt);
  }

  abstract dispose(): void;
}
