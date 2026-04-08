import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

import { registerCoreGraphVisualizerElement } from "@monorepo/core-graph-visualisation/lit";
import {
  GraphSvgSceneFactory,
  GridGraphConstraintEngine,
  type GraphNodeVisualRepresentation,
  type IGraphSvgSceneFactory,
} from "@monorepo/core-graph-visualisation";
import {
  D3ForceLayoutReactiveController,
  D3SpringLayoutReactiveController,
} from "@monorepo/core-graph-visualization-d3";
import {
  DGMLForceDirectedLayoutStrategy,
  DGMLLayoutReactiveController,
  DGMLLayeredLayoutStrategy,
} from "@monorepo/core-graph-visualization-dgml";
import "./components/DagStateWebComponent.js";

import {
  GraphVisualizationCompositionRoot,
  type GraphVisualizationApplicationModel,
} from "./app/GraphVisualizationCompositionRoot.js";

registerCoreGraphVisualizerElement();

type LayoutOptionId =
  | "d3-force"
  | "d3-spring-simulation"
  | "grid"
  | "dgml-layered-top-to-bottom"
  | "dgml-layered-bottom-to-top"
  | "dgml-layered-left-to-right"
  | "dgml-layered-right-to-left"
  | "dgml-clustered"
  | "dgml-force";

interface LayoutOption {
  readonly id: LayoutOptionId;
  readonly label: string;
  readonly algorithmName: string;
  readonly sceneFactory: IGraphSvgSceneFactory;
}

type NodeRepresentationOption = GraphNodeVisualRepresentation;

@customElement("graph-visualization-app")
export class GraphVisualizationApp extends LitElement {
  private readonly application: GraphVisualizationApplicationModel;
  private readonly d3ForceController = new D3ForceLayoutReactiveController(this);
  private readonly d3SpringController = new D3SpringLayoutReactiveController(this, {
    onAnimationFrame: () => this.requestVisualizerFrameUpdate(),
  });
  private readonly dgmlTopToBottomController = new DGMLLayoutReactiveController(
    this,
    new DGMLLayeredLayoutStrategy({ direction: "top-to-bottom" }),
  );
  private readonly dgmlBottomToTopController = new DGMLLayoutReactiveController(
    this,
    new DGMLLayeredLayoutStrategy({ direction: "bottom-to-top" }),
  );
  private readonly dgmlLeftToRightController = new DGMLLayoutReactiveController(
    this,
    new DGMLLayeredLayoutStrategy({ direction: "left-to-right" }),
  );
  private readonly dgmlRightToLeftController = new DGMLLayoutReactiveController(
    this,
    new DGMLLayeredLayoutStrategy({ direction: "right-to-left" }),
  );
  private readonly dgmlClusteredController = new DGMLLayoutReactiveController(
    this,
    new DGMLLayeredLayoutStrategy({
      direction: "top-to-bottom",
      clusterByWeaklyConnectedComponents: true,
      clusterGap: 80,
    }),
  );
  private readonly dgmlForceController = new DGMLLayoutReactiveController(this, new DGMLForceDirectedLayoutStrategy());
  private readonly layoutOptions: readonly LayoutOption[] = [
    {
      id: "d3-force",
      label: "D3 Force",
      algorithmName: this.d3ForceController.algorithmName,
      sceneFactory: this.d3ForceController.sceneFactory,
    },
    {
      id: "d3-spring-simulation",
      label: "D3 Spring Simulation",
      algorithmName: this.d3SpringController.algorithmName,
      sceneFactory: this.d3SpringController.sceneFactory,
    },
    {
      id: "grid",
      label: "Grid",
      algorithmName: "GridGraphConstraintEngine",
      sceneFactory: new GraphSvgSceneFactory(new GridGraphConstraintEngine()),
    },
    {
      id: "dgml-layered-top-to-bottom",
      label: "DGML Top to Bottom",
      algorithmName: this.dgmlTopToBottomController.algorithmName,
      sceneFactory: this.dgmlTopToBottomController.sceneFactory,
    },
    {
      id: "dgml-layered-bottom-to-top",
      label: "DGML Bottom to Top",
      algorithmName: this.dgmlBottomToTopController.algorithmName,
      sceneFactory: this.dgmlBottomToTopController.sceneFactory,
    },
    {
      id: "dgml-layered-left-to-right",
      label: "DGML Left to Right",
      algorithmName: this.dgmlLeftToRightController.algorithmName,
      sceneFactory: this.dgmlLeftToRightController.sceneFactory,
    },
    {
      id: "dgml-layered-right-to-left",
      label: "DGML Right to Left",
      algorithmName: this.dgmlRightToLeftController.algorithmName,
      sceneFactory: this.dgmlRightToLeftController.sceneFactory,
    },
    {
      id: "dgml-clustered",
      label: "DGML Clustered",
      algorithmName: this.dgmlClusteredController.algorithmName,
      sceneFactory: this.dgmlClusteredController.sceneFactory,
    },
    {
      id: "dgml-force",
      label: "DGML Force-Directed",
      algorithmName: this.dgmlForceController.algorithmName,
      sceneFactory: this.dgmlForceController.sceneFactory,
    },
  ];
  private selectedLayoutId: LayoutOptionId = "d3-force";
  private selectedNodeRepresentation: NodeRepresentationOption = "box";
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
    this.syncLayoutControllerActivity();
  }

  override disconnectedCallback(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    this.d3SpringController.setActive(false);
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
    const selectedLayout = this.getSelectedLayout();

    return html`
      <section class="shell">
        <header class="masthead">
          <p class="eyebrow">MonoRepro</p>
          <h1>DAG Visualisation Demo</h1>
          <p class="lede">
            The app composes <code>DagGraph</code> from <code>@monorepo/core-graph</code> with the
            Lit 3 visualisation library through explicit contracts and Reactive Controllers.
          </p>
          <label class="layout-picker" for="layout-picker">
            <span>Visualisation layout</span>
            <select
              id="layout-picker"
              @change=${this.onLayoutSelectionChanged}
              .value=${this.selectedLayoutId}
            >
              ${this.layoutOptions.map((option) => html`
                <option value=${option.id}>${option.label}</option>
              `)}
            </select>
          </label>
          <label class="layout-picker" for="node-representation-picker">
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
        </header>

        <dag-state-web-component
          .graph=${this.application.graph}
          .selectionState=${this.application.selectionState}
          .activityState=${this.application.activityState}
          .layoutAlgorithm=${selectedLayout.algorithmName}
        >
          <main class="canvas" slot="outer-box">
            <mr-core-graph-visualizer
              .graph=${this.application.graph}
              .sceneFactory=${selectedLayout.sceneFactory}
              .controllers=${this.application.controllers}
              .width=${this.visualizerWidth}
              .height=${this.visualizerHeight}
              .padding=${96}
              .boxWidth=${150}
              .boxHeight=${64}
              .nodeRepresentation=${this.selectedNodeRepresentation}
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
      width: calc(100vw - 8px);
      max-width: none;
      margin: 0 auto;
      padding: 8px 0 10px;
      min-height: 100svh;
      display: grid;
      grid-template-rows: auto 1fr;
      gap: 8px;
    }

    .masthead {
      margin-bottom: 0;
      padding: 8px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.6);
      border: 1px solid rgba(76, 107, 143, 0.2);
      backdrop-filter: blur(8px);
    }

    .eyebrow {
      margin: 0 0 2px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #4c6b8f;
    }

    h1 {
      margin: 0;
      font-size: clamp(1.5rem, 2.4vw, 2.4rem);
      line-height: 1.05;
    }

    .lede {
      max-width: 72rem;
      margin: 6px 0 0;
      font-size: 0.92rem;
      color: #2d4969;
    }

    .layout-picker {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-top: 8px;
      margin-right: 10px;
      font-size: 0.9rem;
      color: #24476f;
    }

    .layout-picker span {
      font-weight: 600;
    }

    .layout-picker select {
      appearance: none;
      border: 1px solid rgba(76, 107, 143, 0.4);
      border-radius: 10px;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(235, 244, 252, 0.95) 100%);
      color: #18385a;
      font: inherit;
      padding: 8px 30px 8px 10px;
      cursor: pointer;
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

    code {
      padding: 2px 6px;
      border-radius: 6px;
      background: rgba(17, 36, 61, 0.08);
      font-family: Consolas, monospace;
      font-size: 0.9em;
    }

    @media (max-width: 900px) {
      .shell {
        width: calc(100vw - 6px);
        padding: 8px 0 10px;
      }

      .masthead {
        padding: 8px;
      }

      .lede {
        display: none;
      }

      .layout-picker {
        width: 100%;
        justify-content: space-between;
        margin-right: 0;
      }

      .layout-picker select {
        width: min(250px, 65%);
      }

      mr-core-graph-visualizer {
        min-width: 100%;
      }

      .canvas {
        padding: 8px;
        height: clamp(500px, 86svh, 980px);
      }
    }
  `;

  private getSelectedLayout(): LayoutOption {
    return this.layoutOptions.find((option) => option.id === this.selectedLayoutId) ?? this.layoutOptions[0]!;
  }

  private onLayoutSelectionChanged = (event: Event): void => {
    const select = event.target;

    if (!(select instanceof HTMLSelectElement)) {
      return;
    }

    if (
      select.value === "d3-force"
      || select.value === "d3-spring-simulation"
      || select.value === "grid"
      || select.value === "dgml-layered-top-to-bottom"
      || select.value === "dgml-layered-bottom-to-top"
      || select.value === "dgml-layered-left-to-right"
      || select.value === "dgml-layered-right-to-left"
      || select.value === "dgml-clustered"
      || select.value === "dgml-force"
    ) {
      this.selectedLayoutId = select.value;
      this.syncLayoutControllerActivity();
      this.requestUpdate();
    }
  };

  private onNodeRepresentationChanged = (event: Event): void => {
    const select = event.target;

    if (!(select instanceof HTMLSelectElement)) {
      return;
    }

    if (select.value === "box" || select.value === "circle") {
      this.selectedNodeRepresentation = select.value;
      this.requestUpdate();
    }
  };

  private syncLayoutControllerActivity(): void {
    this.d3SpringController.setActive(this.selectedLayoutId === "d3-spring-simulation");
  }

  private requestVisualizerFrameUpdate(): void {
    const visualizer = this.renderRoot.querySelector("mr-core-graph-visualizer") as
      | { requestUpdate?: () => void }
      | null;

    visualizer?.requestUpdate?.();
  }
}
