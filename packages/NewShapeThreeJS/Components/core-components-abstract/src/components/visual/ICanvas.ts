import { IFeatureCollection } from "@monorepo/core-reactive-abstract";
import { IComponent, IVisualComponent } from "../IComponent.js";

export interface ICanvas<THost> extends IVisualComponent {
    render(): void;
    features: IFeatureCollection<THost>;
}
