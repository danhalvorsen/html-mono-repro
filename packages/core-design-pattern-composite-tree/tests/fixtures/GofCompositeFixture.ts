// FIX:
// Do not redeclare `children` in the test type if the base class already exposes it as mutable.
// Your fixture made it readonly, which narrows the inherited property and breaks assignability.

// ====================================================================================
// FILE: tests/fixtures/GofCompositeFixture.ts
// ====================================================================================

import { Composite, Leaf, type IComponent } from "../../src/index.js";

export interface ITestComponent extends IComponent<ITestComponent> {
  readonly executionLog: readonly string[];
}

export class TestLeaf extends Leaf<ITestComponent> implements ITestComponent {
  private readonly log: string[] = [];

  public constructor(public readonly name: string) {
    super(name);
  }

  public get executionLog(): readonly string[] {
    return this.log;
  }

  public operation(): void {
    this.log.push(`leaf:${this.name}`);
  }
}

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

export class GofCompositeFixture {
  public createLeaf(name: string = "Leaf"): TestLeaf {
    return new TestLeaf(name);
  }

  public createComposite(name: string = "Composite"): TestComposite {
    return new TestComposite(name);
  }

  public createCompositeWithTwoLeaves(): {
    root: TestComposite;
    leaf1: TestLeaf;
    leaf2: TestLeaf;
  } {
    const root = this.createComposite("Root");
    const leaf1 = this.createLeaf("Leaf-1");
    const leaf2 = this.createLeaf("Leaf-2");

    root.add(leaf1);
    root.add(leaf2);

    return { root, leaf1, leaf2 };
  }

  public createNestedTree(): {
    root: TestComposite;
    groupA: TestComposite;
    groupB: TestComposite;
    leaf1: TestLeaf;
    leaf2: TestLeaf;
    leaf3: TestLeaf;
  } {
    const root = this.createComposite("Root");
    const groupA = this.createComposite("Group-A");
    const groupB = this.createComposite("Group-B");

    const leaf1 = this.createLeaf("Leaf-1");
    const leaf2 = this.createLeaf("Leaf-2");
    const leaf3 = this.createLeaf("Leaf-3");

    groupA.add(leaf1);
    groupA.add(leaf2);
    groupB.add(leaf3);

    root.add(groupA);
    root.add(groupB);

    return { root, groupA, groupB, leaf1, leaf2, leaf3 };
  }
}