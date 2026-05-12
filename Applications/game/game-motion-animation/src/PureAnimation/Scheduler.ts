import { html, LitElement } from "lit";

/**
 * Contract for children that receive scheduler frame ticks.
 */
export interface ITimerSlot {
  onTimer(time: number): void;
}

/**
 * Frame scheduler web component that forwards time ticks to slotted children.
 */
export class Scheduler extends LitElement {
  public static readonly tagName = "scheduler-wc";
  private static readonly frameIntervalMs = 1000 / 60;
  private timer: number | null;

  constructor() {
    super();
    this.timer = null;
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this.start();
  }

  public override disconnectedCallback(): void {
    this.stop();
    super.disconnectedCallback();
  }

  protected override render() {
    return html`
      <slot name="animation"></slot>
      <slot></slot>
    `;
  }

  private start(): void {
    if (this.timer !== null) {
      return;
    }

    this.timer = globalThis.setInterval(
      () => this.onTimer(performance.now()),
      Scheduler.frameIntervalMs,
    );
  }

  private stop(): void {
    if (this.timer === null) {
      return;
    }

    globalThis.clearInterval(this.timer);
    this.timer = null;
  }

  private onTimer(time: number): void {
    for (const child of Array.from(this.children)) {
      const timerChild = child as Element & Partial<ITimerSlot>;
      if (typeof timerChild.onTimer === "function") {
        timerChild.onTimer(time);
      }
    }
  }
}

if (!customElements.get(Scheduler.tagName)) {
  customElements.define(Scheduler.tagName, Scheduler);
}
