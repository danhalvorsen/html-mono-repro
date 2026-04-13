import type { ReactiveControllerHost } from "lit";

import {
  GraphSvgSceneFactory,
  GridGraphConstraintEngine,
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

import type { LayoutOptionDescriptor, LayoutOptionId } from "./GraphVisualizationLayoutTypes.js";

export interface GraphVisualizationLayoutRegistration extends LayoutOptionDescriptor {
  readonly algorithmName: string;
  readonly sceneFactory: IGraphSvgSceneFactory;
  readonly setActive: (isActive: boolean) => void;
}

export interface IGraphVisualizationLayoutControllerRegistry {
  readonly options: readonly LayoutOptionDescriptor[];

  getLayout(layoutId: LayoutOptionId): GraphVisualizationLayoutRegistration | undefined;
  deactivateAll(): void;
}

export interface GraphVisualizationLayoutControllerRegistryOptions {
  readonly requestAnimationHostUpdate?: () => void;
}

export class GraphVisualizationLayoutControllerRegistry implements IGraphVisualizationLayoutControllerRegistry {
  private readonly layouts: ReadonlyMap<LayoutOptionId, GraphVisualizationLayoutRegistration>;

  constructor(host: ReactiveControllerHost, options: GraphVisualizationLayoutControllerRegistryOptions = {}) {
    const d3ForceController = new D3ForceLayoutReactiveController(host);
    const d3SpringController = new D3SpringLayoutReactiveController(host, {
      requestHostUpdate: options.requestAnimationHostUpdate,
    });
    const dgmlTopToBottomController = new DGMLLayoutReactiveController(
      host,
      new DGMLLayeredLayoutStrategy({ direction: "top-to-bottom" }),
    );
    const dgmlBottomToTopController = new DGMLLayoutReactiveController(
      host,
      new DGMLLayeredLayoutStrategy({ direction: "bottom-to-top" }),
    );
    const dgmlLeftToRightController = new DGMLLayoutReactiveController(
      host,
      new DGMLLayeredLayoutStrategy({ direction: "left-to-right" }),
    );
    const dgmlRightToLeftController = new DGMLLayoutReactiveController(
      host,
      new DGMLLayeredLayoutStrategy({ direction: "right-to-left" }),
    );
    const dgmlClusteredController = new DGMLLayoutReactiveController(
      host,
      new DGMLLayeredLayoutStrategy({
        direction: "top-to-bottom",
        clusterByWeaklyConnectedComponents: true,
        clusterGap: 80,
      }),
    );
    const dgmlForceController = new DGMLLayoutReactiveController(host, new DGMLForceDirectedLayoutStrategy());

    const entries: readonly GraphVisualizationLayoutRegistration[] = [
      {
        id: "d3-force",
        label: "D3 Force",
        algorithmName: d3ForceController.algorithmName,
        sceneFactory: d3ForceController.sceneFactory,
        setActive: () => {},
      },
      {
        id: "d3-spring-simulation",
        label: "D3 Spring Simulation",
        algorithmName: d3SpringController.algorithmName,
        sceneFactory: d3SpringController.sceneFactory,
        setActive: (isActive: boolean) => {
          d3SpringController.setActive(isActive);
        },
      },
      {
        id: "grid",
        label: "Grid",
        algorithmName: "GridGraphConstraintEngine",
        sceneFactory: new GraphSvgSceneFactory(new GridGraphConstraintEngine()),
        setActive: () => {},
      },
      {
        id: "dgml-layered-top-to-bottom",
        label: "DGML Top to Bottom",
        algorithmName: dgmlTopToBottomController.algorithmName,
        sceneFactory: dgmlTopToBottomController.sceneFactory,
        setActive: () => {},
      },
      {
        id: "dgml-layered-bottom-to-top",
        label: "DGML Bottom to Top",
        algorithmName: dgmlBottomToTopController.algorithmName,
        sceneFactory: dgmlBottomToTopController.sceneFactory,
        setActive: () => {},
      },
      {
        id: "dgml-layered-left-to-right",
        label: "DGML Left to Right",
        algorithmName: dgmlLeftToRightController.algorithmName,
        sceneFactory: dgmlLeftToRightController.sceneFactory,
        setActive: () => {},
      },
      {
        id: "dgml-layered-right-to-left",
        label: "DGML Right to Left",
        algorithmName: dgmlRightToLeftController.algorithmName,
        sceneFactory: dgmlRightToLeftController.sceneFactory,
        setActive: () => {},
      },
      {
        id: "dgml-clustered",
        label: "DGML Clustered",
        algorithmName: dgmlClusteredController.algorithmName,
        sceneFactory: dgmlClusteredController.sceneFactory,
        setActive: () => {},
      },
      {
        id: "dgml-force",
        label: "DGML Force-Directed",
        algorithmName: dgmlForceController.algorithmName,
        sceneFactory: dgmlForceController.sceneFactory,
        setActive: () => {},
      },
    ];

    this.layouts = new Map(entries.map((entry) => [entry.id, entry] as const));
  }

  get options(): readonly LayoutOptionDescriptor[] {
    return Array.from(this.layouts.values()).map((layout) => ({
      id: layout.id,
      label: layout.label,
    }));
  }

  getLayout(layoutId: LayoutOptionId): GraphVisualizationLayoutRegistration | undefined {
    return this.layouts.get(layoutId);
  }

  deactivateAll(): void {
    this.layouts.forEach((layout) => {
      layout.setActive(false);
    });
  }
}
