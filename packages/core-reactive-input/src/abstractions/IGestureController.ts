import { IInputController } from "./IInputController.js";

/**
 * Defines the semantic gesture types recognized by the system.
 * This list can expand easily for future gestures (rotate, hold, double-tap, etc.)
 */
export type GestureType =
  | "tap"
  | "double-tap"
  | "long-press"
  | "swipe"
  | "pinch"
  | "rotate";

/**
 * Represents a normalized high-level gesture event.
 */
export interface IGestureEvent {
  /** Gesture type, e.g., "tap", "swipe", "pinch" */
  type: GestureType;

  /** Gesture semantic identifier (e.g., "swipe-left", "pinch", etc.) */
  gesture: string;

  /** Coordinates (usually centroid of touches) */
  x: number;
  y: number;

  /** Gesture-specific properties (optional, e.g., scale, rotation angle) */
  scale?: number;
  angle?: number;
  velocity?: number;

  /** Optional modifiers (for combined keyboard+touch gestures) */
  modifiers?: {
    alt?: boolean;
    ctrl?: boolean;
    shift?: boolean;
    meta?: boolean;
  };

  /** Underlying platform event (TouchEvent, PointerEvent, etc.) */
  originalEvent?: Event;

  /** Optional target (DOM node, 3D object, etc.) */
  target?: unknown;
}

/**
 * Contract for gesture interpreters that convert low-level input events
 * (touch or pointer) into high-level semantic gesture events.
 */
export interface IGestureController extends IInputController<IGestureEvent> {
  /**
   * Start processing gesture input.
   * For DOM, this may attach touch/pointer subscriptions or
   * simply ensure the dependent input controllers (Touch/Pointer) are active.
   */
  enable(): void;

  /**
   * Stop processing gestures and detach any handlers.
   */
  disable(): void;

  /**
   * Clean up internal resources and clear subscriptions.
   */
  destroy(): void;
}
