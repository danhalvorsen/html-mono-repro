// Applications/app-core-math-colors-samples/src/renderers/IGradientRenderer.ts
import { LitElement, html } from "lit";

import type { IGradient } from "@monorepo/core-math-colors";
import { customElement } from "lit/decorators.js";
import { property } from "lit/decorators.js";
import type { IGradientRenderer } from "./IGradientRenderer.js";

export interface IGradientRendererElement extends HTMLElement, IGradientRenderer<IGradient> {}

@customElement("mr-gradient-renderer-ui")
export class GradientRendererUI
  extends LitElement
  implements IGradientRenderer<IGradient>
{
  @property({ attribute: false })
  public gradient: IGradient | null = null;

  protected override render() {
    return html`
      <div
        style=${`height: 40px; border-radius: 8px; border: 1px solid rgb(203 213 225); background: ${this.buildBackground(this.gradient)}`}
      ></div>
    `;
  }

  public buildBackground(gradient: IGradient | null): string {
    if (gradient === null || gradient.count === 0) {
      return "transparent";
    }

    const stops = gradient.getAll();

    if (stops.length === 0) {
      return "transparent";
    }

    if (stops.length === 1) {
      const only = stops[0];

      if (only === undefined) {
        return "transparent";
      }

      const color = only.color.toCssRgba();
      return `linear-gradient(to right, ${color}, ${color})`;
    }

    const cssStops: string[] = [];

    for (const stop of stops) {
      const percentage = stop.position * 100;
      cssStops.push(`${stop.color.toCssRgba()} ${percentage}%`);
    }

    return `linear-gradient(to right, ${cssStops.join(", ")})`;
  }

  protected override createRenderRoot(): this {
    return this;
  }
}// Applications/app-core-math-colors-samples/src/renderers/YellowGradientRendererUI.ts

@customElement("mr-yellow-gradient-renderer-ui")
export class YellowGradientRendererUI
  extends LitElement
  implements IGradientRenderer<IGradient>
{
  public buildBackground(_gradient: IGradient | null): string {
    return "linear-gradient(to right, rgb(255 235 59), rgb(255 235 59))";
  }

  protected override createRenderRoot(): this {
    return this;
  }
}