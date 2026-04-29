import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { IDagGraph } from "@monorepo/core-graph";

import type { IControllerActivityState } from "../app/ControllerActivityState.js";
import type { INodeSelectionState } from "../app/NodeSelectionState.js";
import "./DagStateWebComponent.js";

@customElement("graph-visualization-workspace")
export class GraphVisualizationWorkspace extends LitElement {
  @property({ attribute: false })
  graph!: IDagGraph;

  @property({ attribute: false })
  selectionState!: INodeSelectionState;

  @property({ attribute: false })
  activityState!: IControllerActivityState;

  @property({ type: String })
  layoutAlgorithm = "unknown";

  override render() {
    return html`
      <dag-state-web-component
        .graph=${this.graph}
        .selectionState=${this.selectionState}
        .activityState=${this.activityState}
        .layoutAlgorithm=${this.layoutAlgorithm}
      >
        <slot name="canvas" slot="outer-box"></slot>
      </dag-state-web-component>
    `;
  }
}
