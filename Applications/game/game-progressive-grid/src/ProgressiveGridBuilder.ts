import type { GridPatchDefinition } from "./GridPatchDefinition.js";
import type { GridPatchResolution } from "./GridPatchResolution.js";
import type { IGridNeighbourDetector } from "./IGridNeighbourDetector.js";
import type { IGridPatchFactory } from "./IGridPatchFactory.js";
import type { IGridResolutionNegotiator } from "./IGridResolutionNegotiator.js";
import type { IProgressiveGrid } from "./IProgressiveGrid.js";
import { ProgressiveGrid } from "./ProgressiveGrid.js";

export class ProgressiveGridBuilder {
  private readonly neighbourDetector: IGridNeighbourDetector;
  private readonly resolutionNegotiator: IGridResolutionNegotiator;
  private readonly patchFactory: IGridPatchFactory;

  public constructor(
    neighbourDetector: IGridNeighbourDetector,
    resolutionNegotiator: IGridResolutionNegotiator,
    patchFactory: IGridPatchFactory,
  ) {
    this.neighbourDetector = neighbourDetector;
    this.resolutionNegotiator = resolutionNegotiator;
    this.patchFactory = patchFactory;
  }

  public build(definitions: readonly GridPatchDefinition[]): IProgressiveGrid {
    this.assertDefinitions(definitions);

    const neighbours = this.neighbourDetector.findNeighbours(definitions);
    const negotiatedResolutions = this.resolutionNegotiator.negotiate(definitions, neighbours);

    const patches = definitions.map((definition) => {
      const resolution = this.getRequiredResolution(negotiatedResolutions, definition.id);
      return this.patchFactory.create(definition, resolution);
    });

    return new ProgressiveGrid(patches, neighbours);
  }

  private assertDefinitions(definitions: readonly GridPatchDefinition[]): void {
    if (definitions.length === 0) {
      throw new Error("Progressive grid requires at least one patch definition.");
    }

    const ids = new Set<string>();

    for (const definition of definitions) {
      this.assertDefinition(definition);

      if (ids.has(definition.id)) {
        throw new Error(`Duplicate grid patch definition id: ${definition.id}`);
      }

      ids.add(definition.id);
    }
  }

  private assertDefinition(definition: GridPatchDefinition): void {
    if (definition.id.trim().length === 0) {
      throw new Error("Grid patch id cannot be empty.");
    }

    this.assertBounds(definition);
    this.assertResolution(definition.resolution);
  }

  private assertBounds(definition: GridPatchDefinition): void {
    const bounds = definition.bounds;

    if (
      !Number.isFinite(bounds.x0) ||
      !Number.isFinite(bounds.x1) ||
      !Number.isFinite(bounds.y0) ||
      !Number.isFinite(bounds.y1)
    ) {
      throw new Error(`Grid patch bounds must be finite for patch: ${definition.id}`);
    }

    if (!(bounds.x0 < bounds.x1)) {
      throw new Error(`Grid patch x0 must be lower than x1 for patch: ${definition.id}`);
    }

    if (!(bounds.y0 < bounds.y1)) {
      throw new Error(`Grid patch y0 must be lower than y1 for patch: ${definition.id}`);
    }
  }

  private assertResolution(resolution: GridPatchResolution): void {
    if (!Number.isInteger(resolution.xSamples) || resolution.xSamples < 2) {
      throw new Error("Grid patch xSamples must be an integer greater than or equal to 2.");
    }

    if (!Number.isInteger(resolution.ySamples) || resolution.ySamples < 2) {
      throw new Error("Grid patch ySamples must be an integer greater than or equal to 2.");
    }
  }

  private getRequiredResolution(
    resolutions: ReadonlyMap<string, GridPatchResolution>,
    patchId: string,
  ): GridPatchResolution {
    const resolution = resolutions.get(patchId);

    if (resolution === undefined) {
      throw new Error(`Missing negotiated resolution for patch: ${patchId}`);
    }

    return resolution;
  }
}
