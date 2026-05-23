import { GridPatch } from "./GridPatch.js";
import type { GridPatchDefinition } from "./GridPatchDefinition.js";
import type { GridPatchResolution } from "./GridPatchResolution.js";
import type { IGridPatch } from "./IGridPatch.js";
import type { IGridPatchFactory } from "./IGridPatchFactory.js";
import type { ISamplingPolicy } from "./ISamplingPolicy.js";

export class UniformGridPatchFactory implements IGridPatchFactory {
  private readonly samplingPolicy: ISamplingPolicy;

  public constructor(samplingPolicy: ISamplingPolicy) {
    this.samplingPolicy = samplingPolicy;
  }

  public create(definition: GridPatchDefinition, resolution: GridPatchResolution): IGridPatch {
    const xSamples = this.samplingPolicy.createSamples(
      definition.bounds.x0,
      definition.bounds.x1,
      resolution.xSamples,
    );

    const ySamples = this.samplingPolicy.createSamples(
      definition.bounds.y0,
      definition.bounds.y1,
      resolution.ySamples,
    );

    return new GridPatch(definition.id, definition.bounds, xSamples, ySamples);
  }
}
