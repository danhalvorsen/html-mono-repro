import type { IFeatureCollection } from "@monorepo/core-reactive-abstract";
import type { IComponent } from "./components/IComponent.js";

export interface IShell<THost> extends IComponent {
  readonly features: IFeatureCollection<THost>;
}