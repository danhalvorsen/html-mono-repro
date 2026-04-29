import { describe, expect, it, vi } from "vitest";

import type { ReactiveControllerHost } from "lit";
import type { IGraphSvgSceneFactory } from "@monorepo/core-graph-visualisation";

import {
  GraphVisualizationCoordinator,
  type IGraphVisualizationCoordinator,
} from "../src/app/GraphVisualizationCoordinator.js";
import type {
  LayoutOptionDescriptor,
  LayoutOptionId,
} from "../src/app/GraphVisualizationLayoutTypes.js";
import type {
  GraphVisualizationLayoutRegistration,
  IGraphVisualizationLayoutControllerRegistry,
} from "../src/app/GraphVisualizationLayoutControllerRegistry.js";

function createHostFake(): ReactiveControllerHost {
  return {
    addController: vi.fn(),
    removeController: vi.fn(),
    requestUpdate: vi.fn(),
    updateComplete: Promise.resolve(true),
  };
}

function createSceneFactoryStub(): IGraphSvgSceneFactory {
  return {
    createScene: vi.fn(),
  } as unknown as IGraphSvgSceneFactory;
}

function createRegistryFake() {
  const activationOrder: LayoutOptionId[] = [];
  const deactivationOrder: LayoutOptionId[] = [];
  const layouts: GraphVisualizationLayoutRegistration[] = [
    {
      id: "d3-force",
      label: "D3 Force",
      algorithmName: "D3ForceGraphLayout",
      sceneFactory: createSceneFactoryStub(),
      setActive: (isActive: boolean) => {
        if (isActive) {
          activationOrder.push("d3-force");
          return;
        }

        deactivationOrder.push("d3-force");
      },
    },
    {
      id: "d3-spring-simulation",
      label: "D3 Spring Simulation",
      algorithmName: "SimulationD3SpringSimulation",
      sceneFactory: createSceneFactoryStub(),
      setActive: (isActive: boolean) => {
        if (isActive) {
          activationOrder.push("d3-spring-simulation");
          return;
        }

        deactivationOrder.push("d3-spring-simulation");
      },
    },
    {
      id: "grid",
      label: "Grid",
      algorithmName: "GridGraphConstraintEngine",
      sceneFactory: createSceneFactoryStub(),
      setActive: (isActive: boolean) => {
        if (isActive) {
          activationOrder.push("grid");
          return;
        }

        deactivationOrder.push("grid");
      },
    },
  ];
  const map = new Map(layouts.map((layout) => [layout.id, layout] as const));

  const registry: IGraphVisualizationLayoutControllerRegistry = {
    options: layouts.map<LayoutOptionDescriptor>((layout) => ({ id: layout.id, label: layout.label })),
    getLayout: (layoutId: LayoutOptionId) => map.get(layoutId),
    deactivateAll: vi.fn(() => {
      map.forEach((layout) => layout.setActive(false));
    }),
  };

  return {
    registry,
    activationOrder,
    deactivationOrder,
    deactivateAllSpy: registry.deactivateAll as ReturnType<typeof vi.fn>,
  };
}

function createRegistryWithCustomLayout(): IGraphVisualizationLayoutControllerRegistry {
  const layouts: GraphVisualizationLayoutRegistration[] = [
    {
      id: "d3-force",
      label: "D3 Force",
      algorithmName: "D3ForceGraphLayout",
      sceneFactory: createSceneFactoryStub(),
      setActive: () => {},
    },
    {
      id: "grid",
      label: "Grid",
      algorithmName: "GridGraphConstraintEngine",
      sceneFactory: createSceneFactoryStub(),
      setActive: () => {},
    },
    {
      id: "custom-layout",
      label: "Custom Layout",
      algorithmName: "CustomContractCompatibleLayout",
      sceneFactory: createSceneFactoryStub(),
      setActive: () => {},
    },
  ];
  const map = new Map(layouts.map((layout) => [layout.id, layout] as const));

  return {
    options: layouts.map<LayoutOptionDescriptor>((layout) => ({ id: layout.id, label: layout.label })),
    getLayout: (layoutId: LayoutOptionId) => map.get(layoutId),
    deactivateAll: vi.fn(() => {
      map.forEach((layout) => layout.setActive(false));
    }),
  };
}

function createReplacementRegistry(algorithmName: string): IGraphVisualizationLayoutControllerRegistry {
  const layouts: GraphVisualizationLayoutRegistration[] = [
    {
      id: "d3-force",
      label: "D3 Force",
      algorithmName,
      sceneFactory: createSceneFactoryStub(),
      setActive: () => {},
    },
    {
      id: "grid",
      label: "Grid",
      algorithmName: "GridGraphConstraintEngine",
      sceneFactory: createSceneFactoryStub(),
      setActive: () => {},
    },
  ];
  const map = new Map(layouts.map((layout) => [layout.id, layout] as const));

  return {
    options: layouts.map<LayoutOptionDescriptor>((layout) => ({ id: layout.id, label: layout.label })),
    getLayout: (layoutId: LayoutOptionId) => map.get(layoutId),
    deactivateAll: vi.fn(() => {
      map.forEach((layout) => layout.setActive(false));
    }),
  };
}

describe("GraphVisualizationCoordinator", () => {
  it("Given coordinator When unknown layout id is selected Then active layout remains unchanged", () => {
    const requestHostUpdate = vi.fn();
    const { registry } = createRegistryFake();
    const coordinator: IGraphVisualizationCoordinator = new GraphVisualizationCoordinator({
      host: createHostFake(),
      requestHostUpdate,
      registry,
    });

    coordinator.setLayout("not-a-layout" as LayoutOptionId);

    expect(coordinator.selectedLayoutId).toBe("d3-force");
    expect(requestHostUpdate).not.toHaveBeenCalled();
  });

  it("Given coordinator When same layout is selected again Then no additional host update is requested", () => {
    const requestHostUpdate = vi.fn();
    const { registry } = createRegistryFake();
    const coordinator: IGraphVisualizationCoordinator = new GraphVisualizationCoordinator({
      host: createHostFake(),
      requestHostUpdate,
      registry,
    });

    coordinator.setLayout("d3-force");

    expect(requestHostUpdate).not.toHaveBeenCalled();
  });

  it("Given coordinator When valid layout changes Then scene factory and algorithm name update", () => {
    const { registry } = createRegistryFake();
    const coordinator: IGraphVisualizationCoordinator = new GraphVisualizationCoordinator({
      host: createHostFake(),
      requestHostUpdate: vi.fn(),
      registry,
    });

    coordinator.setLayout("d3-spring-simulation");

    expect(coordinator.selectedLayoutId).toBe("d3-spring-simulation");
    expect(coordinator.layoutAlgorithmName).toBe("SimulationD3SpringSimulation");
  });

  it("Given invalid resize input When width and height are non-positive Then dimensions are clamped", () => {
    const { registry } = createRegistryFake();
    const coordinator: IGraphVisualizationCoordinator = new GraphVisualizationCoordinator({
      host: createHostFake(),
      requestHostUpdate: vi.fn(),
      registry,
    });

    coordinator.resize({ width: 0, height: -100 });

    expect(coordinator.visualizerWidth).toBe(360);
    expect(coordinator.visualizerHeight).toBe(320);
  });

  it("Given equivalent effective bounds When resize is repeated Then no duplicate host update is requested", () => {
    const requestHostUpdate = vi.fn();
    const { registry } = createRegistryFake();
    const coordinator: IGraphVisualizationCoordinator = new GraphVisualizationCoordinator({
      host: createHostFake(),
      requestHostUpdate,
      registry,
    });

    coordinator.resize({ width: 600.9, height: 420.9 });
    const afterFirstResize = requestHostUpdate.mock.calls.length;
    coordinator.resize({ width: 600.2, height: 420.2 });

    expect(requestHostUpdate.mock.calls.length).toBe(afterFirstResize);
  });

  it("Given active coordinator When host disconnects Then no throw occurs and state remains readable", () => {
    const { registry } = createRegistryFake();
    const coordinator: IGraphVisualizationCoordinator = new GraphVisualizationCoordinator({
      host: createHostFake(),
      requestHostUpdate: vi.fn(),
      registry,
    });

    coordinator.hostConnected();

    expect(() => coordinator.hostDisconnected()).not.toThrow();
    expect(coordinator.selectedLayoutId).toBe("d3-force");
  });

  it("Given rapid layout switch sequence When selections are processed Then final selected layout remains active", () => {
    const { registry, activationOrder } = createRegistryFake();
    const coordinator: IGraphVisualizationCoordinator = new GraphVisualizationCoordinator({
      host: createHostFake(),
      requestHostUpdate: vi.fn(),
      registry,
    });

    coordinator.setLayout("d3-spring-simulation");
    coordinator.setLayout("grid");
    coordinator.setLayout("d3-force");

    expect(coordinator.selectedLayoutId).toBe("d3-force");
    expect(activationOrder.at(-1)).toBe("d3-force");
  });

  it("Given disconnected coordinator When layout and resize are invoked Then no host update is requested", () => {
    const requestHostUpdate = vi.fn();
    const { registry } = createRegistryFake();
    const coordinator: IGraphVisualizationCoordinator = new GraphVisualizationCoordinator({
      host: createHostFake(),
      requestHostUpdate,
      registry,
    });

    coordinator.hostDisconnected();
    coordinator.setLayout("d3-spring-simulation");
    coordinator.resize({ width: 1200, height: 900 });

    expect(coordinator.selectedLayoutId).toBe("d3-force");
    expect(coordinator.visualizerWidth).toBe(960);
    expect(coordinator.visualizerHeight).toBe(640);
    expect(requestHostUpdate).not.toHaveBeenCalled();
  });

  it("Given connected coordinator When host disconnects Then all layouts are deactivated", () => {
    const { registry, deactivateAllSpy } = createRegistryFake();
    const coordinator: IGraphVisualizationCoordinator = new GraphVisualizationCoordinator({
      host: createHostFake(),
      requestHostUpdate: vi.fn(),
      registry,
    });

    coordinator.hostConnected();
    coordinator.hostDisconnected();

    expect(deactivateAllSpy).toHaveBeenCalled();
  });

  it("Given animated updates When multiple update triggers occur in a single frame Then at most one host update request is published for that frame", () => {
    const requestHostUpdate = vi.fn();
    const frameCallbacks: Array<() => void> = [];
    const coordinator: IGraphVisualizationCoordinator = new GraphVisualizationCoordinator({
      host: createHostFake(),
      requestHostUpdate,
      registry: createRegistryFake().registry,
      scheduleAnimationFrame: (callback) => {
        frameCallbacks.push(callback);
      },
    });

    (coordinator as unknown as { requestAnimationHostUpdate: () => void }).requestAnimationHostUpdate();
    (coordinator as unknown as { requestAnimationHostUpdate: () => void }).requestAnimationHostUpdate();
    (coordinator as unknown as { requestAnimationHostUpdate: () => void }).requestAnimationHostUpdate();

    expect(frameCallbacks).toHaveLength(1);
    frameCallbacks[0]!();
    expect(requestHostUpdate).toHaveBeenCalledTimes(1);
  });

  it("Given missing host frame surface When animation update publish throws Then coordinator keeps state consistent", () => {
    const frameCallbacks: Array<() => void> = [];
    const coordinator: IGraphVisualizationCoordinator = new GraphVisualizationCoordinator({
      host: createHostFake(),
      requestHostUpdate: () => {
        throw new Error("missing frame surface");
      },
      registry: createRegistryFake().registry,
      scheduleAnimationFrame: (callback) => {
        frameCallbacks.push(callback);
      },
    });

    (coordinator as unknown as { requestAnimationHostUpdate: () => void }).requestAnimationHostUpdate();

    expect(() => frameCallbacks[0]!()).not.toThrow();
    expect(coordinator.selectedLayoutId).toBe("d3-force");
  });

  it("Given a new registry layout When the layout is selected Then coordinator consumers require no behavioral changes", () => {
    const coordinator: IGraphVisualizationCoordinator = new GraphVisualizationCoordinator({
      host: createHostFake(),
      requestHostUpdate: vi.fn(),
      registry: createRegistryWithCustomLayout(),
    });

    coordinator.setLayout("custom-layout" as LayoutOptionId);

    expect(coordinator.selectedLayoutId).toBe("custom-layout");
    expect(coordinator.layoutAlgorithmName).toBe("CustomContractCompatibleLayout");
  });

  it("Given replacement registries with the same contract When coordinator uses either registry Then host integration surface remains unchanged", () => {
    const coordinatorA: IGraphVisualizationCoordinator = new GraphVisualizationCoordinator({
      host: createHostFake(),
      requestHostUpdate: vi.fn(),
      registry: createReplacementRegistry("ReplacementA"),
    });
    const coordinatorB: IGraphVisualizationCoordinator = new GraphVisualizationCoordinator({
      host: createHostFake(),
      requestHostUpdate: vi.fn(),
      registry: createReplacementRegistry("ReplacementB"),
    });

    coordinatorA.setLayout("grid");
    coordinatorB.setLayout("grid");

    expect(typeof coordinatorA.setLayout).toBe("function");
    expect(typeof coordinatorB.setLayout).toBe("function");
    expect(typeof coordinatorA.sceneFactory.createScene).toBe("function");
    expect(typeof coordinatorB.sceneFactory.createScene).toBe("function");
    expect(coordinatorA.selectedLayoutId).toBe("grid");
    expect(coordinatorB.selectedLayoutId).toBe("grid");
  });
});
