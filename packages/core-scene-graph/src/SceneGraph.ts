
import type { ISceneNode } from "./ISceneNode.js";

type DirtyAwareSceneNode = ISceneNode & {
  updateSelfWorld(parent?: unknown, parentChanged?: boolean): boolean;
};

export class SceneGraph {
  public constructor(private readonly root: ISceneNode) { }

  public add(child: ISceneNode): void {
    this.addChild(this.root, child);
  }

  public addChild(parent: ISceneNode, child: ISceneNode): void {
    if (!("add" in parent) || typeof parent.add !== "function") {
      throw new Error("Parent node does not support child attachment.");
    }

    parent.add(child);
  }

  public update(): void {
    this.updateNode(this.root, undefined, false);
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

  private updateNode(node: ISceneNode, parentWorld: unknown, parentChanged: boolean): void {
    let worldChanged: boolean;

    if (this.isDirtyAware(node)) {
      worldChanged = node.updateSelfWorld(parentWorld, parentChanged);
    } else if (parentWorld === undefined) {
      node.updateWorld();
      worldChanged = true;
    } else {
      node.updateWorld(parentWorld as never);
      worldChanged = true;
    }

    for (const child of node.getChildren()) {
      this.updateNode(child, node.world, worldChanged);
    }
  }

  private isDirtyAware(node: ISceneNode): node is DirtyAwareSceneNode {
    return "updateSelfWorld" in node && typeof node.updateSelfWorld === "function";
  }
}
