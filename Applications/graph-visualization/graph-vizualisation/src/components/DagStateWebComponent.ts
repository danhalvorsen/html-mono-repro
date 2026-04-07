import type { IDagGraph } from "@monorepo/core-graph";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { IControllerActivityState } from "../app/ControllerActivityState.js";
import type { INodeSelectionState } from "../app/NodeSelectionState.js";

@customElement("dag-state-web-component")
export class DagStateWebComponent extends LitElement {
  @property({ attribute: false })
  graph!: IDagGraph;

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
          <h2>DAG State</h2>
          <p>Acyclic: <strong>${this.graph.isAcyclic ? "yes" : "no"}</strong></p>
          <p>Nodes: <strong>${this.graph.nodes.length}</strong></p>
          <p>Edges: <strong>${this.graph.edges.length}</strong></p>
          <p>Last clicked node: <strong>${this.selectionState.selectedNodeId}</strong></p>
          <p>Active controller: <strong>${this.activityState.activeControllerName}</strong></p>
          <p>Controller activity: <strong>${this.activityState.activityMessage}</strong></p>
          <p>Layout algorithm: <strong>${this.layoutAlgorithm}</strong></p>
          <p class="hint">
            Click a node to show its connection points. Click an edge to highlight the line and its
            start/end connection points. Drag from one connection point to another to create an edge.
            Right-click a node to add a child.
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
      grid-template-columns: 280px minmax(0, 1fr);
      gap: 20px;
      align-items: stretch;
      width: 100%;
    }

    .panel {
      border: 1px solid rgba(76, 107, 143, 0.24);
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.72);
      box-shadow: 0 24px 50px rgba(46, 78, 109, 0.12);
      backdrop-filter: blur(10px);
      padding: 20px;
    }

    .panel h2 {
      margin: 0 0 12px;
      font-size: 1.1rem;
    }

    .panel p {
      margin: 0 0 10px;
      line-height: 1.5;
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
      this.observedElement.addEventListener("graph-box:right-click", this.onGraphInteraction as EventListener);
      this.observedElement.addEventListener("graph-connection-point:click", this.onGraphInteraction as EventListener);
      this.observedElement.addEventListener("graph-connection-point:connect", this.onGraphInteraction as EventListener);
      this.observedElement.addEventListener("graph-connection-point:right-click", this.onGraphInteraction as EventListener);
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
    this.observedElement.removeEventListener("graph-box:right-click", this.onGraphInteraction as EventListener);
    this.observedElement.removeEventListener("graph-connection-point:click", this.onGraphInteraction as EventListener);
    this.observedElement.removeEventListener("graph-connection-point:connect", this.onGraphInteraction as EventListener);
    this.observedElement.removeEventListener("graph-connection-point:right-click", this.onGraphInteraction as EventListener);
    this.observedElement.removeEventListener("graph-edge:click", this.onGraphInteraction as EventListener);
    this.observedElement = undefined;
  }
}
