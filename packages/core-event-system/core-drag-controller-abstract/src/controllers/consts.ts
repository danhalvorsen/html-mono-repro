import { defineEventName, EventName } from "../types/common/event-name.js";

export namespace Drag {
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

  // Convenience named constants
  export const DRAG_START = DragEvents.DRAG_START;
  export const DRAG_MOVE = DragEvents.DRAG_MOVE;
  export const DRAG_END = DragEvents.DRAG_END;
  export const DRAG_ENTER = DragEvents.DRAG_ENTER;
  export const DRAG_LEAVE = DragEvents.DRAG_LEAVE;
  export const DRAG_OVER = DragEvents.DRAG_OVER;
  export const DRAG_DROP = DragEvents.DRAG_DROP;
  export const DRAG_MOVE_EVENT: EventName = DragEvents.DRAG_MOVE_EVENT;
}
