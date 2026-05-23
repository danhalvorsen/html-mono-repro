import { ConstantZGridPointProjector } from "./ConstantZGridPointProjector.js";
import { CounterClockwiseGridCellTriangulator } from "./CounterClockwiseGridCellTriangulator.js";
import { DefaultGridMaterialFactory } from "./DefaultGridMaterialFactory.js";
import { GridPatchTopologyResolver } from "./GridPatchTopologyResolver.js";
import type { IGridMaterialFactory } from "./IGridMaterialFactory.js";
import type { IGridPatchGeometryFactory } from "./IGridPatchGeometryFactory.js";
import type { IGridPatchMeshFactory } from "./IGridPatchMeshFactory.js";
import type { IGridPatchTopologyResolver } from "./IGridPatchTopologyResolver.js";
import type { IGridCellTriangulator } from "./IGridCellTriangulator.js";
import type { IGridPointProjector } from "./IGridPointProjector.js";
import type { IProgressiveGridGroupFactory } from "./IProgressiveGridGroupFactory.js";
import { ThreeGridPatchGeometryFactory } from "./ThreeGridPatchGeometryFactory.js";
import { ThreeGridPatchMeshFactory } from "./ThreeGridPatchMeshFactory.js";
import { ThreeProgressiveGridGroupFactory } from "./ThreeProgressiveGridGroupFactory.js";

export type ThreeProgressiveGridServices = Readonly<{
  readonly topologyResolver: IGridPatchTopologyResolver;
  readonly projector: IGridPointProjector;
  readonly triangulator: IGridCellTriangulator;
  readonly geometryFactory: IGridPatchGeometryFactory;
  readonly materialFactory: IGridMaterialFactory;
  readonly meshFactory: IGridPatchMeshFactory;
  readonly groupFactory: IProgressiveGridGroupFactory;
}>;

export function createDefaultThreeProgressiveGridServices(z = 0): ThreeProgressiveGridServices {
  const topologyResolver = new GridPatchTopologyResolver();
  const projector = new ConstantZGridPointProjector(z);
  const triangulator = new CounterClockwiseGridCellTriangulator();
  const geometryFactory = new ThreeGridPatchGeometryFactory(
    topologyResolver,
    projector,
    triangulator,
  );
  const materialFactory = new DefaultGridMaterialFactory();
  const meshFactory = new ThreeGridPatchMeshFactory(geometryFactory, materialFactory);
  const groupFactory = new ThreeProgressiveGridGroupFactory(meshFactory);

  return {
    topologyResolver,
    projector,
    triangulator,
    geometryFactory,
    materialFactory,
    meshFactory,
    groupFactory,
  };
}
