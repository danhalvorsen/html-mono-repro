/**
 * Generic input controller interface.
 * Base for all device-specific input controllers (mouse, touch, pen, gesture, etc.)
 */
export interface IInputController<TEvent = IInputEvent> {
  /**
   * Subscribe to a specific input event type (e.g., "pointerdown", "touchmove").
   */
  on(type: string, handler: (e: TEvent) => void): void;

  /**
   * Unsubscribe a specific handler.
   */
  off(type: string, handler: (e: TEvent) => void): void;

  /**
   * Stop listening to all hardware events and release resources.
   */
  destroy(): void;
}

/**
 * A minimal normalized base input event.
 * Specialized event types (IMouseEvent, ITouchEvent, etc.) extend this.
 */
export interface IInputEvent {
  /** Event type identifier (e.g., "pointerdown", "touchstart", etc.) */
  type: string;

  /** Normalized position in client coordinates. */
  x: number;
  y: number;

  /** Source device or element (optional). */
  target?: unknown;

  /** Original DOM or framework event (optional). */
  originalEvent?: Event;

  /** Common modifier keys pressed. */
  modifiers?: {
    alt?: boolean;
    ctrl?: boolean;
    shift?: boolean;
    meta?: boolean;
  };
}
