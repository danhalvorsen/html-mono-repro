// src/svg/contracts/ISvgObject.ts
export interface ISvgObject {
  /** Stable identifier for add/remove. */
  readonly id: string;

  /** Create DOM nodes (once) and return the root node to mount into <svg>. */
  create(): SVGElement;

  /** Update DOM nodes to reflect current state. Must be idempotent. */
  update(): void;

  /** Optional cleanup hook (event listeners etc). */
  destroy?(): void;
}