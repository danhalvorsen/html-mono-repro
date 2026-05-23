import type { IMaterialFactory } from "@monorepo/core-threejs-app-framework/src/Materials/IMaterialFactory.js";
import type { IUpdatable } from "@monorepo/core-threejs-app-framework/src/IUpdatable.js";
import type { IThreeScene } from "../IThreeScene.js";

export type PlaygroundInstance = IUpdatable & {
  dispose?: () => void;
};

export type PlaygroundPluginDependencies = Readonly<{
  scene: IThreeScene;
  materialFactory: IMaterialFactory;
}>;

export interface PlaygroundPlugin {
  readonly id: string;
  readonly label: string;
  create(deps: PlaygroundPluginDependencies): PlaygroundInstance;
}
