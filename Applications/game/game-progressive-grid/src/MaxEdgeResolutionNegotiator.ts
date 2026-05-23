import type { GridNeighbour } from "./GridNeighbour.js";
import type { GridPatchDefinition } from "./GridPatchDefinition.js";
import type { GridPatchResolution } from "./GridPatchResolution.js";
import type { IGridResolutionNegotiator } from "./IGridResolutionNegotiator.js";
import { SharedEdgeOrientation } from "./SharedEdgeOrientation.js";

export class MaxEdgeResolutionNegotiator implements IGridResolutionNegotiator {
  public negotiate(
    definitions: readonly GridPatchDefinition[],
    neighbours: readonly GridNeighbour[],
  ): ReadonlyMap<string, GridPatchResolution> {
    const resolutions = this.createInitialResolutions(definitions);

    let changed = true;

    while (changed) {
      changed = false;

      for (const neighbour of neighbours) {
        if (neighbour.orientation === SharedEdgeOrientation.Vertical) {
          changed = this.alignYResolution(neighbour, resolutions) || changed;
          continue;
        }

        if (neighbour.orientation === SharedEdgeOrientation.Horizontal) {
          changed = this.alignXResolution(neighbour, resolutions) || changed;
          continue;
        }

        throw new Error(`Unsupported shared edge orientation: ${String(neighbour.orientation)}`);
      }
    }

    return new Map(resolutions);
  }

  private createInitialResolutions(
    definitions: readonly GridPatchDefinition[],
  ): Map<string, GridPatchResolution> {
    const resolutions = new Map<string, GridPatchResolution>();

    for (const definition of definitions) {
      resolutions.set(definition.id, {
        xSamples: definition.resolution.xSamples,
        ySamples: definition.resolution.ySamples,
      });
    }

    return resolutions;
  }

  private alignXResolution(
    neighbour: GridNeighbour,
    resolutions: Map<string, GridPatchResolution>,
  ): boolean {
    const first = this.getRequiredResolution(resolutions, neighbour.firstPatchId);
    const second = this.getRequiredResolution(resolutions, neighbour.secondPatchId);
    const sampleCount = Math.max(first.xSamples, second.xSamples);

    let changed = false;

    if (first.xSamples !== sampleCount) {
      resolutions.set(neighbour.firstPatchId, { ...first, xSamples: sampleCount });
      changed = true;
    }

    if (second.xSamples !== sampleCount) {
      resolutions.set(neighbour.secondPatchId, { ...second, xSamples: sampleCount });
      changed = true;
    }

    return changed;
  }

  private alignYResolution(
    neighbour: GridNeighbour,
    resolutions: Map<string, GridPatchResolution>,
  ): boolean {
    const first = this.getRequiredResolution(resolutions, neighbour.firstPatchId);
    const second = this.getRequiredResolution(resolutions, neighbour.secondPatchId);
    const sampleCount = Math.max(first.ySamples, second.ySamples);

    let changed = false;

    if (first.ySamples !== sampleCount) {
      resolutions.set(neighbour.firstPatchId, { ...first, ySamples: sampleCount });
      changed = true;
    }

    if (second.ySamples !== sampleCount) {
      resolutions.set(neighbour.secondPatchId, { ...second, ySamples: sampleCount });
      changed = true;
    }

    return changed;
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
