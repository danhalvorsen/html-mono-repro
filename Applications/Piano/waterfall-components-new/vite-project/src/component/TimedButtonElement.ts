import { html, LitElement, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

export const TimedButtonElementTagName = "timed-button";

export class TimedButtonEventName {
  public static readonly HoldStarted = "timed-button-hold-started";
  public static readonly HoldChanged = "timed-button-hold-changed";
  public static readonly HoldCompleted = "timed-button-hold-completed";
  public static readonly HoldCancelled = "timed-button-hold-cancelled";
}

export type TimedButtonHoldDetail = Readonly<{
  readonly heldMs: number;
}>;

export type TimedButtonHoldStartedDetail = TimedButtonHoldDetail;
export type TimedButtonHoldChangedDetail = TimedButtonHoldDetail;
export type TimedButtonHoldCompletedDetail = TimedButtonHoldDetail;
export type TimedButtonHoldCancelledDetail = TimedButtonHoldDetail;

@customElement(TimedButtonElementTagName)
export class TimedButtonElement extends LitElement {
  private pressedAtMs: number | null = null;
  private frameId: number | null = null;

  public override disconnectedCallback(): void {
    this.stopHoldProgress();
    this.pressedAtMs = null;

    super.disconnectedCallback();
  }

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

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (this.pressedAtMs !== null) {
      return;
    }

    this.pressedAtMs = performance.now();
    this.capturePointer(event);

    this.dispatchHoldEvent(TimedButtonEventName.HoldStarted, 0);
    this.startHoldProgress();
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    if (this.pressedAtMs === null) {
      return;
    }

    const heldMs = this.calculateHeldMs();

    this.releasePointer(event);
    this.stopHoldProgress();
    this.pressedAtMs = null;

    this.dispatchHoldEvent(TimedButtonEventName.HoldCompleted, heldMs);
  };

  private readonly onPointerCancel = (event: PointerEvent): void => {
    if (this.pressedAtMs === null) {
      return;
    }

    const heldMs = this.calculateHeldMs();

    this.releasePointer(event);
    this.stopHoldProgress();
    this.pressedAtMs = null;

    this.dispatchHoldEvent(TimedButtonEventName.HoldCancelled, heldMs);
  };

  private startHoldProgress(): void {
    if (this.frameId !== null) {
      return;
    }

    this.frameId = requestAnimationFrame(this.onHoldProgressFrame);
  }

  private stopHoldProgress(): void {
    if (this.frameId === null) {
      return;
    }

    cancelAnimationFrame(this.frameId);
    this.frameId = null;
  }

  private readonly onHoldProgressFrame = (): void => {
    if (this.pressedAtMs === null) {
      this.frameId = null;
      return;
    }

    this.dispatchHoldEvent(
      TimedButtonEventName.HoldChanged,
      this.calculateHeldMs(),
    );

    this.frameId = requestAnimationFrame(this.onHoldProgressFrame);
  };

  private calculateHeldMs(): number {
    if (this.pressedAtMs === null) {
      return 0;
    }

    return Math.max(0, performance.now() - this.pressedAtMs);
  }

  private dispatchHoldEvent(
    eventName: string,
    heldMs: number,
  ): void {
    this.dispatchEvent(
      new CustomEvent<TimedButtonHoldDetail>(eventName, {
        bubbles: true,
        composed: true,
        detail: { heldMs },
      }),
    );
  }

  private capturePointer(event: PointerEvent): void {
    const target = event.currentTarget;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (!target.hasPointerCapture(event.pointerId)) {
      target.setPointerCapture(event.pointerId);
    }
  }

  private releasePointer(event: PointerEvent): void {
    const target = event.currentTarget;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "timed-button": TimedButtonElement;
  }
}
