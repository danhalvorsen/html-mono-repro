// packages/core-design-pattern-composite-tree/src/Composite.ts

import type { IComponent } from "./IComponent.js";
import type { ICompositeNode } from "./ICompositeNode.js";

export abstract class Composite<TNode>
  implements ICompositeNode<TNode>
{
  private readonly children: TNode[] = [];

  protected constructor(public readonly name: string) {}

  public add(child: TNode): void {
    this.children.push(child);
  }

  public remove(predicate: (child: TNode) => boolean): void {
    const index = this.children.findIndex(predicate);

    if (index >= 0) {
      this.children.splice(index, 1);
    }
  }

  public getChildren(): readonly TNode[] {
    return this.children;
  }

  public operation(): void {
    for (const child of this.children) {
      const component = child as unknown as IComponent<TNode>;
      component.operation();
    }
  }
}