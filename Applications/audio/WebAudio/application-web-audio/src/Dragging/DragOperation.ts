
export const DragOperation = {
  Start: "drag.start",
  Move: "drag.move",
  Over: "drag.over",
  Drop: "drag.drop",
  Cancel: "drag.cancel",
} as const;

export type DragOperation =
  (typeof DragOperation)[keyof typeof DragOperation];