import type { IGraph } from "@monorepo/core-graph";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { IControllerActivityState } from "../app/ControllerActivityState.js";
import type { INodeSelectionState } from "../app/NodeSelectionState.js";

@customElement("dag-state-web-component")
export class DagStateWebComponent extends LitElement {
  @property({ attribute: false })
  graph!: IGraph;

  @property({ attribute: false })
  selectionState!: INodeSelectionState;

  @property({ attribute: false })
  activityState!: IControllerActivityState;

  @property({ type: String })
  layoutAlgorithm = "unknown";

  private observedElement: HTMLElement | undefined;

  override render() {
    return html`
      <section class="workspace">
        <aside class="panel">
          <h2>Graph State</h2>
          <p>Nodes: <strong>${this.graph.nodes.length}</strong></p>
          <p>Edges: <strong>${this.graph.edges.length}</strong></p>
          <p>Last clicked node: <strong>${this.selectionState.selectedNodeId}</strong></p>
          <p>Active controller: <strong>${this.activityState.activeControllerName}</strong></p>
          <p>Controller activity: <strong>${this.activityState.activityMessage}</strong></p>
          <p>Layout algorithm: <strong>${this.layoutAlgorithm}</strong></p>
          <p class="hint">
            Circle-only graph view. Edges are rendered from node center to node center.
          </p>
        </aside>

        <slot name="outer-box" @slotchange=${this.onOuterBoxSlotChange}></slot>
      </section>
    `;
  }

  static override styles = css`
    :host {
      display: block;
    }

    .workspace {
      display: grid;
      grid-template-columns: clamp(190px, 18vw, 230px) minmax(0, 1fr);
      gap: 12px;
      align-items: stretch;
      width: 100%;
    }

    .panel {
      border: 1px solid rgba(76, 107, 143, 0.24);
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.72);
      box-shadow: 0 24px 50px rgba(46, 78, 109, 0.12);
      backdrop-filter: blur(10px);
      padding: 12px;
    }

    .panel h2 {
      margin: 0 0 12px;
      font-size: 1.1rem;
    }

    .panel p {
      margin: 0 0 8px;
      line-height: 1.35;
    }

    .hint {
      color: #4c6b8f;
      font-size: 0.95rem;
    }

    ::slotted([slot="outer-box"]) {
      display: block;
      width: 100%;
      height: 100%;
      min-width: 0;
    }

    @media (max-width: 900px) {
      .workspace {
        grid-template-columns: 1fr;
      }
    }
  `;

  override disconnectedCallback(): void {
    this.detachObservedElement();
    super.disconnectedCallback();
  }

  private onOuterBoxSlotChange = (event: Event): void => {
    const slot = event.target as HTMLSlotElement;
    const assignedElement = slot.assignedElements({ flatten: true })[0];

    this.detachObservedElement();

    if (assignedElement instanceof HTMLElement) {
      this.observedElement = assignedElement;
      this.observedElement.addEventListener("graph-box:click", this.onGraphInteraction as EventListener);
      this.observedElement.addEventListener("graph-edge:click", this.onGraphInteraction as EventListener);
    }
  };

  private onGraphInteraction = (): void => {
    queueMicrotask(() => {
      this.requestUpdate();
    });
  };

  private detachObservedElement(): void {
    if (this.observedElement === undefined) {
      return;
    }

    this.observedElement.removeEventListener("graph-box:click", this.onGraphInteraction as EventListener);
    this.observedElement.removeEventListener("graph-edge:click", this.onGraphInteraction as EventListener);
    this.observedElement = undefined;
  }
}