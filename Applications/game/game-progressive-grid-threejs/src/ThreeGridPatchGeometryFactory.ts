import { BufferAttribute, BufferGeometry } from "three";
import type { IGridPatch } from "@monorepo/game-progressive-grid";
import { ConstantZGridPointProjector } from "./ConstantZGridPointProjector.js";
import { CounterClockwiseGridCellTriangulator } from "./CounterClockwiseGridCellTriangulator.js";
import type { GridPatchGeometryOptions } from "./GridPatchGeometryOptions.js";
import type { IGridCellTriangulator } from "./IGridCellTriangulator.js";
import type { IGridPatchGeometryFactory } from "./IGridPatchGeometryFactory.js";
import type { IGridPatchTopologyResolver } from "./IGridPatchTopologyResolver.js";
import type { IGridPointProjector } from "./IGridPointProjector.js";
import { GridPatchTopologyResolver } from "./GridPatchTopologyResolver.js";

export class ThreeGridPatchGeometryFactory implements IGridPatchGeometryFactory {
  private readonly topologyResolver: IGridPatchTopologyResolver;
  private readonly defaultProjector: IGridPointProjector;
  private readonly defaultTriangulator: IGridCellTriangulator;

  public constructor(
    topologyResolver: IGridPatchTopologyResolver = new GridPatchTopologyResolver(),
    defaultProjector: IGridPointProjector = new ConstantZGridPointProjector(),
    defaultTriangulator: IGridCellTriangulator = new CounterClockwiseGridCellTriangulator(),
  ) {
    this.topologyResolver = topologyResolver;
    this.defaultProjector = defaultProjector;
    this.defaultTriangulator = defaultTriangulator;
  }

  public createGeometry(
    patch: IGridPatch,
    options: GridPatchGeometryOptions = {},
  ): BufferGeometry {
    const topology = this.topologyResolver.resolve(patch);
    const projector = options.projector ?? this.defaultProjector;
    const triangulator = options.triangulator ?? this.defaultTriangulator;

    const positions = new Float32Array(topology.getPoints().length * 3);

    let targetIndex = 0;

    for (let rowIndex = 0; rowIndex < topology.rowCount; rowIndex += 1) {
      for (let columnIndex = 0; columnIndex < topology.columnCount; columnIndex += 1) {
        const linearIndex = rowIndex * topology.columnCount + columnIndex;
        const point = topology.getPoint(columnIndex, rowIndex);

        const projected = projector.project({
          patch,
          point,
          columnIndex,
          rowIndex,
          columnCount: topology.columnCount,
          rowCount: topology.rowCount,
          linearIndex,
        });

        positions[targetIndex] = projected.x;
        targetIndex += 1;

        positions[targetIndex] = projected.y;
        targetIndex += 1;

        positions[targetIndex] = projected.z;
        targetIndex += 1;
      }
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setIndex(new BufferAttribute(triangulator.createIndices(
      topology.columnCount,
      topology.rowCount,
    ), 1));

    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    return geometry;
  }
}
