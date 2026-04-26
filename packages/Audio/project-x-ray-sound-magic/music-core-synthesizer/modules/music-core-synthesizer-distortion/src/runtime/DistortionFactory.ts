import {
  DistortionDefinitionValidator,
  type DistortionDefinition,
  type IDistortion,
  type IDistortionFactory,
} from "@monorepo/music-core-synthesizer-distortion-contracts";

import {
  DistortionAlgorithmFactory,
  type IDistortionAlgorithmFactory,
} from "../algorithms/index.js";
import { Distortion } from "./Distortion.js";

export class DistortionFactory implements IDistortionFactory {
  public constructor(
    private readonly definitionValidator: DistortionDefinitionValidator,
    private readonly algorithmFactory: IDistortionAlgorithmFactory,
  ) {}

  public static createDefault(): DistortionFactory {
    return new DistortionFactory(
      DistortionDefinitionValidator.createDefault(),
      new DistortionAlgorithmFactory(),
    );
  }

  public create(definition: DistortionDefinition): IDistortion {
    this.definitionValidator.validate(definition);

    return new Distortion(
      definition,
      this.algorithmFactory.create(definition),
      this.definitionValidator,
    );
  }
}
