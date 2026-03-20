// TestComposite.ts

import { Composite } from "../../src/index.js";
import type { ITestComponent } from "./GofCompositeFixture.js";

export class TestComposite extends Composite<ITestComponent> implements ITestComponent {
  private readonly log: string[] = [];

  public constructor(public readonly name: string) {
    super(name);
  }

  public get executionLog(): readonly string[] {
    return this.log;
  }

  public override operation(): void {
    this.log.push(`composite:${this.name}:before`);
    super.operation();
    this.log.push(`composite:${this.name}:after`);
  }
}