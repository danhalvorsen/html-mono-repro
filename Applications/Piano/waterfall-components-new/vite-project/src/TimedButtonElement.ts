import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("timed-button")
export class TimedButtonElement extends LitElement {
  private downAt = 0;
  @state() private heldMs = 0;

  protected override render() {
    return html`<button @pointerdown=${this.down} @pointerup=${this.up}>Click me</button>
      <span>${this.heldMs.toFixed(0)} ms</span>`;
  }

  private readonly down = (): void => { this.downAt = performance.now(); };
  private readonly up = (): void => { this.heldMs = performance.now() - this.downAt; };
}