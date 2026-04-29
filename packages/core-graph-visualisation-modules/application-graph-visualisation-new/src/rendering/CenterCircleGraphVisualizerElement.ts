import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { GraphSvgScene } from "@monorepo/core-graph-visualisation";
import { renderSimpleGraphSceneSvg } from "./SimpleGraphSceneSvgRenderer.js";

@customElement("mr-core-graph-center-circle-visualizer")
export class CenterCircleGraphVisualizerElement extends LitElement {
  @property({ attribute: false })
  scene: GraphSvgScene | undefined;

  override render() {
    if (this.scene === undefined) {
      return null;
    }

    return renderSimpleGraphSceneSvg(this.scene);
  }
}