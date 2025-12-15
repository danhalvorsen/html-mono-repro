import { MouseEventType } from "./MouseEventType.js";

/**
 * Normalized mouse or pointer event.
 */

export interface IMouseEvent {
  /** Event type (pointerdown, wheel, etc.) */
  type: MouseEventType;

  /** Screen-space position in client coordinates */
  x: number;
  y: number;

  /** Mouse button index (0=left,1=middle,2=right) */
  button?: number;

  /** Wheel scroll delta */
  deltaX?: number;
  deltaY?: number;

  /** Optional modifier keys */
  modifiers?: {
    alt?: boolean;
    ctrl?: boolean;
    shift?: boolean;
    meta?: boolean;
  };

  /** Original DOM event */
  originalEvent?: Event;

  /** Event target element or object */
  target?: unknown;
}
