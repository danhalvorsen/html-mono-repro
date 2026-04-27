import type { IViewFeature } from "./IViewFeature.js";

import { AboutFeature } from "../features/aboutFeature/aboutFeature.js";
import { HomeFeature } from "../features/homeFeature/homeFeature.js";
import { SoundTestFeature } from "../features/soundTestFeature/soundTestFeature.js";
import { FooFooFeature } from "../features/fooFooFeature/fooFooFeature.js";
import { MultiOscillatorsFeature } from "../features/multiOscillatorsFeature/multiOscillatorsFeature.js";

export class ViewFeatureCatalog {
  private readonly featuresById: ReadonlyMap<string, IViewFeature>;

  public constructor(private readonly registeredFeatures: readonly IViewFeature[]) {
    this.featuresById = new Map(
      registeredFeatures.map((feature) => [feature.id, feature]),
    );
  }

  public get defaultFeature(): IViewFeature {
    const firstFeature = this.registeredFeatures[0];

    if (firstFeature === undefined) {
      throw new Error("At least one view feature must be registered.");
    }

    return firstFeature;
  }

  public get features(): readonly IViewFeature[] {
    return this.registeredFeatures;
  }

  public findById(id: string): IViewFeature | undefined {
    return this.featuresById.get(id);
  }
}

export function createViewFeatureCatalog(): ViewFeatureCatalog {
  return new ViewFeatureCatalog([
    new HomeFeature(),
    new AboutFeature(),
    new SoundTestFeature(),
    new FooFooFeature(),
    new MultiOscillatorsFeature(),
  ]);
}
