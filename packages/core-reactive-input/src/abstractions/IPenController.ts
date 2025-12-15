import { IInputController } from "./IInputController.js";

/**
 * Supported pen / stylus event types.
 * Uses Pointer Events API or platform equivalents.
 */
export type PenEventType =
  | "pointerdown"
  | "pointermove"
  | "pointerup"
  | "pointercancel";

/**
 * Represents a normalized stylus/pen event.
 */
export interface IPenEvent {
  /** Event type */
  type: PenEventType;

  /** Pen tip position in client coordinates */
  x: number;
  y: number;

  /** Pressure value (0–1) */
  pressure?: number;

  /** Tilt in degrees (if supported) */
  tiltX?: number;
  tiltY?: number;

  /** Barrel button or eraser flags */
  buttons?: number;

  /** Optional modifiers (keyboard state) */
  modifiers?: {
    alt?: boolean;
    ctrl?: boolean;
    shift?: boolean;
    meta?: boolean;
  };

  /** Raw platform event (PointerEvent, Wacom API, etc.) */
  originalEvent?: Event;

  /** Event target (HTMLElement, 3D object, etc.) */
  target?: unknown;
}

/**
 * Contract for pen input controllers.
 * Mirrors IInputController and adds lifecycle hooks.
 */
export interface IPenController extends IInputController<IPenEvent> {
  enable(): void;
  disable(): void;
  destroy(): void;
}
