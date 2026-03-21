// ====================================================================================
// FILE: FakeGradientDataSource.ts (FIXED)
// ====================================================================================

import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import type { IGradient } from "@monorepo/core-math-colors";
import gradients from "./data/Gradients.json";
import { GradientMapper } from "./GradientMapper";

@customElement("mr-fake-gradient-data-source")
export class FakeGradientDataSource extends LitElement {
  public static override styles = css`
    :host {
      display: block;
    }
  `;
  constructor() {
    super();
    console.log("FakeGradientDataSource INSTANCE CREATED");
  }
  private readonly _gradients: readonly IGradient[] = (() => {
    const source = Array.isArray(gradients)
      ? gradients
      : (gradients as any).default;

    if (!Array.isArray(source)) {
      throw new Error("Gradients JSON is not an array");
    }
    console.log("Loaded gradients:", source.length);
    return source.map((g) => GradientMapper.fromJson(g));
  })();

  protected override render() {
    return html`
      ${this._gradients.map((g, i) => {
        console.log("Rendering gradient:", i);

        return html`
          <mr-new-gradient-ui .gradient=${g}>
            <mr-gradient-renderer-ui></mr-gradient-renderer-ui>
          </mr-new-gradient-ui>
        `;
      })}
    `;
  }
}
