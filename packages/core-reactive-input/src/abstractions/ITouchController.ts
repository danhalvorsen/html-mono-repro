import { IInputController } from "./IInputController.js";

/**
 * A unified touch event model supporting multi-touch input.
 * Portable across DOM, Canvas, and WebGL/Three.js layers.
 */
export type TouchEventType =
  | "touchstart"
  | "touchmove"
  | "touchend"
  | "touchcancel";

/**
 * Represents a normalized touch event.
 */
export interface ITouchEvent {
  /** Event type (touchstart/move/end/cancel) */
  type: TouchEventType;

  /** Primary coordinate (usually the first touch) */
  x: number;
  y: number;

  /** All active touches */
  touches: Array<{ id: number; x: number; y: number }>;

  /** Touches that changed in this event */
  changedTouches?: Array<{ id: number; x: number; y: number }>;

  /** Modifier keys pressed */
  modifiers?: {
    alt?: boolean;
    ctrl?: boolean;
    shift?: boolean;
    meta?: boolean;
  };

  /** The DOM or render-layer target */
  target?: unknown;

  /** Original platform event (DOM TouchEvent or equivalent) */
  originalEvent?: Event;
}

/**
 * Contract for a touch controller that emits normalized ITouchEvent streams.
 * Extends the base IInputController<T> abstraction.
 */
export interface ITouchController extends IInputController<ITouchEvent> {
  /** Start listening to touch events */
  enable(): void;

  /** Stop listening and release all resources */
  disable(): void;

  /** Remove listeners and clear all handlers */
  destroy(): void;
}
