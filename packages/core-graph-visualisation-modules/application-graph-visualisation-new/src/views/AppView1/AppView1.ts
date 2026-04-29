import type { IDagGraph } from "@monorepo/core-graph";
import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import { type IApplicationGraphFactory, ApplicationGraphFactory } from "../../app/ApplicationGraphFactory.js";
import { GraphVisualizationCompositionRoot, type GraphVisualizationApplicationModel } from "../../app/GraphVisualizationCompositionRoot.js";
import { type IGraphVisualizationCoordinator, GraphVisualizationCoordinator } from "../../app/GraphVisualizationCoordinator.js";
import type { LayoutOptionId } from "../../app/GraphVisualizationLayoutTypes.js";
import type { SourceGraphId, SourceGraphOption } from "../../app/GraphVisualizationSourceGraphTypes.js";

import { registerCoreGraphVisualizerElement } from "@monorepo/core-graph-visualisation/lit";

import "../../components/DagStateWebComponent.js";
import "../../components/GraphVisualizationCanvas.js";
import "../../components/GraphVisualizationShell.js";
import "../../components/GraphVisualizationToolbar.js";
import "../../components/GraphVisualizationWorkspace.js";

registerCoreGraphVisualizerElement();

@customElement("app-view-1")
export class AppView1 extends LitElement {
    private readonly graphFactory: IApplicationGraphFactory;
    private readonly compositionRoot: GraphVisualizationCompositionRoot;
    private application: GraphVisualizationApplicationModel;
    private readonly coordinator: IGraphVisualizationCoordinator;
    private selectedSourceGraphId: SourceGraphId = "domain";
    private readonly sourceGraphOptions: readonly SourceGraphOption[] = [
        { id: "domain", label: "Domain Graph" },
        { id: "web-component-hierarchy", label: "Web Component Hierarchy" },
        { id: "reactive-controller-ownership", label: "Controller Ownership" },
        { id: "application-architecture", label: "Application Architecture" },
        { id: "hierarchical-organization", label: "Hierarchical Organization" },
        { id: "champions-league-players", label: "Champions League Players" },
    ];

    constructor(
        compositionRoot: GraphVisualizationCompositionRoot = new GraphVisualizationCompositionRoot(),
        graphFactory: IApplicationGraphFactory = new ApplicationGraphFactory()
    ) {
        super();
        this.compositionRoot = compositionRoot;
        this.graphFactory = graphFactory;
        this.application = compositionRoot.compose(graphFactory.createDomainGraph());
        this.coordinator = new GraphVisualizationCoordinator({
            host: this,
            requestHostUpdate: () => {
                this.requestUpdate();
            },
        });
    }

    override connectedCallback(): void {
        super.connectedCallback();
        this.coordinator.hostConnected();
    }

    override disconnectedCallback(): void {
        this.coordinator.hostDisconnected();
        super.disconnectedCallback();
    }

    override firstUpdated(): void {
        // Observation is event-driven from GraphVisualizationCanvas once its internal canvas exists.
    }

    override render() {
        return html`
      <graph-visualization-shell>
        <graph-visualization-toolbar
          slot="toolbar"
          .layoutOptions=${this.coordinator.layoutOptions}
          .selectedLayoutId=${this.coordinator.selectedLayoutId}
          .sourceGraphOptions=${this.sourceGraphOptions}
          .selectedSourceGraphId=${this.selectedSourceGraphId}
          @layout-change=${this.onLayoutSelectionChanged}
          @source-graph-change=${this.onSourceGraphChanged}
        ></graph-visualization-toolbar>

        <graph-visualization-workspace
          slot="workspace"
          .graph=${this.application.graph}
          .selectionState=${this.application.selectionState}
          .activityState=${this.application.activityState}
          .layoutAlgorithm=${this.coordinator.layoutAlgorithmName}
          @graph-canvas-ready=${this.onGraphCanvasReady}
        >
          <graph-visualization-canvas
            slot="canvas"
            .graph=${this.application.graph}
            .sceneFactory=${this.coordinator.sceneFactory}
            .controllers=${this.application.controllers}
            .width=${this.coordinator.visualizerWidth}
            .height=${this.coordinator.visualizerHeight}
            .padding=${96}
            .boxWidth=${64}
            .boxHeight=${64}
            .nodeRepresentation=${"circle"}
          >
            ${this.renderNodeLabelSlots()}
          </graph-visualization-canvas>
        </graph-visualization-workspace>
      </graph-visualization-shell>
    `;
    }

    static override styles = css`
    code {
      padding: 2px 6px;
      border-radius: 6px;
      background: rgba(17, 36, 61, 0.08);
      font-family: Consolas, monospace;
      font-size: 0.9em;
    }
  `;

    private onLayoutSelectionChanged = (event: CustomEvent<LayoutOptionId>): void => {
        this.coordinator.setLayout(event.detail);
    };

    private onSourceGraphChanged = (event: CustomEvent<SourceGraphId>): void => {
        this.selectedSourceGraphId = event.detail;
        this.application = this.compositionRoot.compose(this.resolveSourceGraph(event.detail));
        this.requestUpdate();
    };

    private onGraphCanvasReady = (event: CustomEvent<HTMLElement>): void => {
        this.coordinator.observeCanvas(event.detail);
    };

    private resolveSourceGraph(sourceGraphId: SourceGraphId): IDagGraph {
        switch (sourceGraphId) {
            case "domain":
                return this.graphFactory.createDomainGraph();
            case "web-component-hierarchy":
                return this.graphFactory.createWebComponentHierarchyGraph();
            case "reactive-controller-ownership":
                return this.graphFactory.createReactiveControllerOwnershipGraph();
            case "application-architecture":
                return this.graphFactory.createApplicationArchitectureGraph();
            case "hierarchical-organization":
                return this.graphFactory.createHierarchicalOrganizationGraph();
            case "champions-league-players":
                return this.graphFactory.createChampionsLeaguePlayersGraph();
        }
    }

    private renderNodeLabelSlots() {
        return html`
      <span slot="node-Ingest">Ingest</span>
      <span slot="node-Validate">Validate</span>
      <span slot="node-Transform">Transform</span>
      <span slot="node-Enrich">Enrich</span>
      <span slot="node-Index">Index</span>
      <span slot="node-Serve">Serve</span>
    `;
    }
}
