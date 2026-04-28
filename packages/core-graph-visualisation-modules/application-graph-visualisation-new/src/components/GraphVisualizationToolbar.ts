import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { GraphNodeVisualRepresentation } from "@monorepo/core-graph-visualisation";

import type { LayoutOptionDescriptor, LayoutOptionId } from "../app/GraphVisualizationLayoutTypes.js";
import type { SourceGraphId, SourceGraphOption } from "../app/GraphVisualizationSourceGraphTypes.js";

@customElement("graph-visualization-toolbar")
export class GraphVisualizationToolbar extends LitElement {
  @property({ attribute: false })
  layoutOptions: readonly LayoutOptionDescriptor[] = [];

  @property({ type: String })
  selectedLayoutId: LayoutOptionId = "d3-force";

  @property({ type: String })
  selectedNodeRepresentation: GraphNodeVisualRepresentation = "box";

  @property({ attribute: false })
  sourceGraphOptions: readonly SourceGraphOption[] = [];

  @property({ type: String })
  selectedSourceGraphId: SourceGraphId = "domain";

  override render() {
    return html`
      <label class="picker" for="source-graph-picker">
        <span>Source Graph</span>
        <select id="source-graph-picker" @change=${this.onSourceGraphChanged} .value=${this.selectedSourceGraphId}>
          ${this.sourceGraphOptions.map((option) => html`
            <option value=${option.id}>${option.label}</option>
          `)}
        </select>
      </label>

      <label class="picker" for="layout-picker">
        <span>Visualisation layout</span>
        <select id="layout-picker" @change=${this.onLayoutChanged} .value=${this.selectedLayoutId}>
          ${this.layoutOptions.map((option) => html`
            <option value=${option.id}>${option.label}</option>
          `)}
        </select>
      </label>

      <label class="picker" for="node-representation-picker">
        <span>Node shape</span>
        <select
          id="node-representation-picker"
          @change=${this.onNodeRepresentationChanged}
          .value=${this.selectedNodeRepresentation}
        >
          <option value="box">Box</option>
          <option value="circle">Circle</option>
        </select>
      </label>

      <slot name="toolbar-after"></slot>
    `;
  }

  static override styles = css`
    :host {
      display: block;
    }

    .picker {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-top: 8px;
      margin-right: 10px;
      font-size: 0.9rem;
      color: #24476f;
    }

    .picker span {
      font-weight: 600;
    }

    .picker select {
      appearance: none;
      border: 1px solid rgba(76, 107, 143, 0.4);
      border-radius: 10px;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(235, 244, 252, 0.95) 100%);
      color: #18385a;
      font: inherit;
      padding: 8px 30px 8px 10px;
      cursor: pointer;
    }

    @media (max-width: 900px) {
      .picker {
        width: 100%;
        justify-content: space-between;
        margin-right: 0;
      }

      .picker select {
        width: min(250px, 65%);
      }
    }
  `;

  private onSourceGraphChanged = (event: Event): void => {
    const select = event.target;

    if (!(select instanceof HTMLSelectElement)) {
      return;
    }

    this.dispatchEvent(new CustomEvent<SourceGraphId>("source-graph-change", {
      detail: select.value as SourceGraphId,
      bubbles: true,
      composed: true,
    }));
  };

  private onLayoutChanged = (event: Event): void => {
    const select = event.target;

    if (!(select instanceof HTMLSelectElement)) {
      return;
    }

    this.dispatchEvent(new CustomEvent<LayoutOptionId>("layout-change", {
      detail: select.value as LayoutOptionId,
      bubbles: true,
      composed: true,
    }));
  };

  private onNodeRepresentationChanged = (event: Event): void => {
    const select = event.target;

    if (!(select instanceof HTMLSelectElement)) {
      return;
    }

    if (select.value !== "box" && select.value !== "circle") {
      return;
    }

    this.dispatchEvent(new CustomEvent<GraphNodeVisualRepresentation>("node-representation-change", {
      detail: select.value as GraphNodeVisualRepresentation,
      bubbles: true,
      composed: true,
    }));
  };
}
