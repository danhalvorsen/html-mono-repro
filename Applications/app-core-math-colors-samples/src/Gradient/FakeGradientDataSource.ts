// Applications/app-core-math-colors-samples/src/Gradient/FakeGradientDataSource.ts

import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import type { IGradient } from "@monorepo/core-math-colors";
import { GradientMapper } from "./GradientMapper.js";
import gradients from "./data/Gradients.json";

@customElement("mr-fake-gradient-data-source")
export class FakeGradientDataSource extends LitElement {
  public static override styles = css`
    :host {
      display: contents;
    }
  `;

  private readonly _gradient: IGradient =
    GradientMapper.fromJson(
      (gradients as any[]).find(g => g.name === "ocean-calm") ?? gradients[0]
    );

  protected override render() {
    return html`<slot @slotchange=${this._apply}></slot>`;
  }

  protected override firstUpdated(): void {
    this._apply();
  }

  private _apply(): void {
    const slot = this.renderRoot.querySelector("slot");
    if (!(slot instanceof HTMLSlotElement)) return;

    const el = slot.assignedElements({ flatten: true })[0] as any;
    if (!el) return;

    // KISS: property propagation
    el.gradient = this._gradient;
  }
}