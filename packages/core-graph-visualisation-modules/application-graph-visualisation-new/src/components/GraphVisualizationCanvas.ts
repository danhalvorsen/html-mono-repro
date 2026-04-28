import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { IGraph } from "@monorepo/core-graph";
import type {
  GraphNodeVisualRepresentation,
  IGraphElementController,
  IGraphSvgSceneFactory,
} from "@monorepo/core-graph-visualisation";

const FIXED_NODE_REPRESENTATION: GraphNodeVisualRepresentation = "circle";

@customElement("graph-visualization-canvas")
export class GraphVisualizationCanvas extends LitElement {
  @property({ attribute: false })
  graph!: IGraph;

  @property({ attribute: false })
  sceneFactory!: IGraphSvgSceneFactory;

  @property({ attribute: false })
  controllers: readonly IGraphElementController[] = [];

  @property({ type: Number })
  width = 960;

  @property({ type: Number })
  height = 640;

  @property({ type: Number })
  padding = 96;

  @property({ type: Number })
  boxWidth = 64;

  @property({ type: Number })
  boxHeight = 64;

  @property({ type: String })
  nodeRepresentation: GraphNodeVisualRepresentation = FIXED_NODE_REPRESENTATION;

  override render() {
    return html`
      <main class="canvas">
        <mr-core-graph-visualizer
          .graph=${this.graph}
          .sceneFactory=${this.sceneFactory}
          .controllers=${this.controllers}
          .width=${this.width}
          .height=${this.height}
          .padding=${this.padding}
          .boxWidth=${64}
          .boxHeight=${64}
          .nodeRepresentation=${FIXED_NODE_REPRESENTATION}
        >
          <slot></slot>
        </mr-core-graph-visualizer>
      </main>
    `;
  }

  override firstUpdated(): void {
    const canvasElement = this.getCanvasElement();

    if (canvasElement === null) {
      return;
    }

    this.dispatchEvent(new CustomEvent<HTMLElement>("graph-canvas-ready", {
      detail: canvasElement,
      bubbles: true,
      composed: true,
    }));
  }

  static override styles = css`
    :host {
      display: block;
    }

    .canvas {
      border: 1px solid rgba(76, 107, 143, 0.24);
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.72);
      box-shadow: 0 24px 50px rgba(46, 78, 109, 0.12);
      backdrop-filter: blur(10px);
      padding: 10px;
      width: 100%;
      height: clamp(620px, 86svh, 1400px);
      overflow: hidden;
      box-sizing: border-box;
    }

    mr-core-graph-visualizer {
      display: block;
      width: 100%;
      height: 100%;
      min-width: 0;
    }

    @media (max-width: 900px) {
      .canvas {
        padding: 8px;
        height: clamp(500px, 86svh, 980px);
      }
    }
  `;

  getCanvasElement(): HTMLElement | null {
    const element = this.renderRoot.querySelector("main.canvas");

    return element instanceof HTMLElement ? element : null;
  }
}