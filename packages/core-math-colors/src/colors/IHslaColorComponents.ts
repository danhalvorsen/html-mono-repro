import type { IHslColorComponents } from "./IHslColorComponents.js";


export interface IHslaColorComponents extends IHslColorComponents {
    readonly alpha: number; // normalized [0..1]
}
