import { AccelerationProfileOptions } from "./AccelerationProfileOptions.js";
import { InitialConditionsOptions } from "./InitialConditionsOptions.js";

export interface PhysicalBodyOptions {
  readonly mass: number;
}

export interface PhysicalMovementDefinitionOptions {
  readonly body: PhysicalBodyOptions;
  readonly initialConditions: InitialConditionsOptions;

  /**
   * ax(t), ay(t), possibly piecewise.
   */
  readonly accelerationProfile: AccelerationProfileOptions;
}
