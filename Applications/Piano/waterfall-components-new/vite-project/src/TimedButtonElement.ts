import { html, LitElement, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

export const TimedButtonElementTagName = "timed-button";

export class TimedButtonEventName {
  public static readonly HoldCompleted = "timed-button-hold-completed";
}

export type TimedButtonHoldCompletedDetail = Readonly<{
  readonly heldMs: number;
}>;

@customElement(TimedButtonElementTagName)
export class TimedButtonElement extends LitElement {
  private pressedAtMs: number | null = null;

  protected override render(): TemplateResult {
    return html`
      <button
        @pointerdown=${this.onPointerDown}
        @pointerup=${this.onPointerUp}
        @pointercancel=${this.onPointerCancel}
      >
        <slot></slot>
      </button>
    `;
  }

  private readonly onPointerDown = (): void => {
    this.pressedAtMs = performance.now();
  };

  private readonly onPointerUp = (): void => {
    if (this.pressedAtMs === null) {
      return;
    }

    const heldMs = performance.now() - this.pressedAtMs;
    this.pressedAtMs = null;

    this.dispatchEvent(
      new CustomEvent<TimedButtonHoldCompletedDetail>(
        TimedButtonEventName.HoldCompleted,
        {
          bubbles: true,
          composed: true,
          detail: { heldMs },
        },
      ),
    );
  };

  private readonly onPointerCancel = (): void => {
    this.pressedAtMs = null;
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "timed-button": TimedButtonElement;
  }
}
