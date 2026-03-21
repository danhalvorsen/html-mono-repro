 
import { SceneGraph } from "../index.js";
import type { ISceneNode } from "../ISceneNode.js";
export interface ISceneProjector<TResult> {
  project(node: ISceneNode): readonly TResult[];
}

export class SceneProjector<TResult> {
  public constructor(
    private readonly projector: ISceneProjector<TResult>,
  ) {
  }

  public project(graph: SceneGraph): readonly TResult[] {
    const result: TResult[] = [];

    graph.traverse((node) => {
      result.push(...this.projector.project(node));
    });

    return result;
  }
}