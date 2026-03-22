import type { IComponent } from "./IComponent.js";

export abstract class Leaf<TNode> implements IComponent<TNode> {
  protected constructor(public readonly name: string) {}

  public getChildren(): readonly TNode[] {
    return [];
  }

  public abstract operation(): void;
}