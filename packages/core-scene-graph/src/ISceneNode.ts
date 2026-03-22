import type { IComponent } from "@monorepo/core-design-pattern-composite-tree";
import type { IMatrix } from "@monorepo/core-math";

export interface ISceneNode extends IComponent<ISceneNode> {
  readonly local: IMatrix;
  readonly world: IMatrix;

  updateWorld(parent?: IMatrix): void;
}