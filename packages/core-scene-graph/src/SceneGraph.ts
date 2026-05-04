
import type { ISceneNode } from "./ISceneNode.js";

export class SceneGraph {
  public constructor(private readonly root: ISceneNode) { }

  public update(): void {
    this.root.updateWorld();
  }

  public traverse(visitor: (node: ISceneNode) => void): void {
    const visit = (node: ISceneNode) => {
      visitor(node);

      if ("getChildren" in node) {
        for (const child of node.getChildren()) {
          visit(child);
        }
      }
    };

    visit(this.root);
  }
}
