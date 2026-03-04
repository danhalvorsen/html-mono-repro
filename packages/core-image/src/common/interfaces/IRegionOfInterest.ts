
import { IRectangle } from "./IRectangle.js"

export interface IRegionOfInterest extends IRectangle {

  /** Optional identifier for pipelines or debugging */
  readonly name?: string

  /** Clamp this ROI inside another rectangle (typically image bounds) */
  clamp(bounds: IRectangle): IRegionOfInterest

}