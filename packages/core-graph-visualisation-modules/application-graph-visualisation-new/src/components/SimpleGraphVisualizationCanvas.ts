import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { GraphSvgScene } from "@monorepo/core-graph-visualisation";
import "../rendering/CenterCircleGraphVisualizerElement.js";

@customElement("simple-graph-visualization-canvas")
export class SimpleGraphVisualizationCanvas extends LitElement {
  @property({ attribute: false })
  scene: GraphSvgScene | undefined;

  override render() {
    return html`
      <mr-core-graph-center-circle-visualizer
        .scene=${this.scene}
      ></mr-core-graph-center-circle-visualizer>
    `;
  }
}