import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

import { registerCoreGraphVisualizerElement } from "@monorepo/core-graph-visualisation/lit";
import type { IGraph } from "@monorepo/core-graph";
import {
  GraphSvgSceneFactory,
  type BoxConstraints,
  type GraphCanvasConstraints,
  type GraphConstraintModel,
  type IGraphConstraintEngine,
  type IGraphLayoutStrategy,
} from "@monorepo/core-graph-visualisation";
import { D3ForceGraphLayoutStrategy } from "@monorepo/core-graph-visualization-d3";
import "./components/DagStateWebComponent.js";

import {
  GraphVisualizationCompositionRoot,
  type GraphVisualizationApplicationModel,
} from "./app/GraphVisualizationCompositionRoot.js";

registerCoreGraphVisualizerElement();

class LayoutStrategyConstraintEngineAdapter implements IGraphConstraintEngine {
  constructor(private readonly layoutStrategy: IGraphLayoutStrategy) {}

  createConstraints(
    graph: IGraph,
    canvas: GraphCanvasConstraints,
    box: BoxConstraints,
  ): GraphConstraintModel {
    return this.layoutStrategy.createLayout({ graph, canvas, box });
  }
}

@customElement("graph-visualization-app")
export class GraphVisualizationApp extends LitElement {
  private readonly application: GraphVisualizationApplicationModel;
  private readonly layoutStrategy = new D3ForceGraphLayoutStrategy();
  private readonly sceneFactory = new GraphSvgSceneFactory(
    new LayoutStrategyConstraintEngineAdapter(this.layoutStrategy),
  );
  private visualizerWidth = 960;
  private visualizerHeight = 640;
  private resizeObserver: ResizeObserver | undefined;

  constructor(
    compositionRoot: GraphVisualizationCompositionRoot = new GraphVisualizationCompositionRoot(),
  ) {
    super();
    this.application = compositionRoot.compose();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (entry === undefined) {
        return;
      }

      const nextWidth = Math.max(360, Math.floor(entry.contentRect.width - 4));
      const nextHeight = Math.max(320, Math.floor(entry.contentRect.height - 4));

      if (nextWidth !== this.visualizerWidth || nextHeight !== this.visualizerHeight) {
        this.visualizerWidth = nextWidth;
        this.visualizerHeight = nextHeight;
        this.requestUpdate();
      }
    });
  }

  override disconnectedCallback(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    super.disconnectedCallback();
  }

  override firstUpdated(): void {
    const canvas = this.renderRoot.querySelector("main.canvas");

    if (canvas instanceof HTMLElement) {
      this.resizeObserver?.observe(canvas);
      const width = Math.max(360, Math.floor(canvas.clientWidth - 4));
      const height = Math.max(320, Math.floor(canvas.clientHeight - 4));
      this.visualizerWidth = width;
      this.visualizerHeight = height;
      this.requestUpdate();
    }
  }

  override render() {
    return html`
      <section class="shell">
        <header class="masthead">
          <p class="eyebrow">MonoRepro</p>
          <h1>DAG Visualisation Demo</h1>
          <p class="lede">
            The app composes <code>DagGraph</code> from <code>@monorepo/core-graph</code> with the
            Lit 3 visualisation library through explicit contracts and Reactive Controllers.
          </p>
        </header>

        <dag-state-web-component
          .graph=${this.application.graph}
          .selectionState=${this.application.selectionState}
          .activityState=${this.application.activityState}
          .layoutAlgorithm=${this.layoutStrategy.name}
        >
          <main class="canvas" slot="outer-box">
            <mr-core-graph-visualizer
              .graph=${this.application.graph}
              .sceneFactory=${this.sceneFactory}
              .controllers=${this.application.controllers}
              .width=${this.visualizerWidth}
              .height=${this.visualizerHeight}
              .padding=${96}
              .boxWidth=${150}
              .boxHeight=${64}
            >
              <span slot="node-Ingest">Ingest</span>
              <span slot="node-Validate">Validate</span>
              <span slot="node-Transform">Transform</span>
              <span slot="node-Enrich">Enrich</span>
              <span slot="node-Index">Index</span>
              <span slot="node-Serve">Serve</span>
            </mr-core-graph-visualizer>
          </main>
        </dag-state-web-component>
      </section>
    `;
  }

  static override styles = css`
    :host {
      display: block;
      min-height: 100svh;
      color: #11243d;
      background:
        radial-gradient(circle at top, rgba(210, 227, 243, 0.9), transparent 38%),
        linear-gradient(180deg, #edf3f8 0%, #dbe6ef 100%);
      font-family: "Segoe UI", sans-serif;
    }

    .shell {
      width: min(1200px, calc(100vw - 32px));
      margin: 0 auto;
      padding: 32px 0 48px;
    }

    .masthead {
      margin-bottom: 24px;
    }

    .eyebrow {
      margin: 0 0 8px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #4c6b8f;
    }

    h1 {
      margin: 0;
      font-size: clamp(2.4rem, 4vw, 4rem);
      line-height: 1;
    }

    .lede {
      max-width: 56rem;
      margin: 12px 0 0;
      color: #2d4969;
    }

    .canvas {
      border: 1px solid rgba(76, 107, 143, 0.24);
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.72);
      box-shadow: 0 24px 50px rgba(46, 78, 109, 0.12);
      backdrop-filter: blur(10px);
      padding: 20px;
      width: 100%;
      height: clamp(420px, 68vh, 860px);
      overflow: hidden;
      box-sizing: border-box;
    }

    mr-core-graph-visualizer {
      display: block;
      width: 100%;
      height: 100%;
      min-width: 0;
    }

    code {
      padding: 2px 6px;
      border-radius: 6px;
      background: rgba(17, 36, 61, 0.08);
      font-family: Consolas, monospace;
      font-size: 0.9em;
    }

    @media (max-width: 900px) {
      mr-core-graph-visualizer {
        min-width: 100%;
      }
    }
  `;
}
