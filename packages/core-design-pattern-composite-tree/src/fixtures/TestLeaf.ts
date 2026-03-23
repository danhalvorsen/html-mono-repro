
import { Leaf } from "../Leaf.js";
import { ITestComponent } from "./ITestComponent.js";

export class TestLeaf extends Leaf<ITestComponent> implements ITestComponent {
  private readonly log: string[] = [];

  public constructor(public override readonly name: string) {
    super(name);
  }

  public get executionLog(): readonly string[] {
    return this.log;
  }

  public operation(): void {
    this.log.push(`leaf:${this.name}`);
  }
}
