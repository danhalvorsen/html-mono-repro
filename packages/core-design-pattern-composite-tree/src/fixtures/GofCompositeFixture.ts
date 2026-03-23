import { TestComposite } from "./TestComposite.js";
import { TestLeaf } from "./TestLeaf.js";

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
