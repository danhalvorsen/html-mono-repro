import * as THREE from "three";

import { Composite } from "@monorepo/core-design-pattern-composite-tree";
import { Leaf } from "@monorepo/core-design-pattern-composite-tree";

import type { IPrimitiveFactory } from "../IPrimitiveFactory.js";
import type { IPrimitiveRequest } from "../IPrimitiveRequest.js";

export interface IPrimitiveNode {
  readonly name: string;
  operation(): void;
  getChildren(): readonly IPrimitiveNode[];
  instantiate(): THREE.Object3D;
  cloneNode(): IPrimitiveNode;
}

export class PrimitiveLeaf
  extends Leaf<IPrimitiveNode>
  implements IPrimitiveNode
{
  public constructor(
    name: string,
    private readonly request: IPrimitiveRequest,
    private readonly factory: IPrimitiveFactory,
  ) {
    super(name);
  }

  public operation(): void {
    // no-op
  }

  public instantiate(): THREE.Object3D {
    const instance = this.factory.create(this.request);
    instance.name = this.name;
    return instance;
  }

  public cloneNode(): IPrimitiveNode {
    return new PrimitiveLeaf(
      this.name,
      { ...this.request },
      this.factory,
    );
  }
}

export class PrimitiveComposite
  extends Composite<IPrimitiveNode>
  implements IPrimitiveNode
{
  public constructor(name: string) {
    super(name);
  }

  public instantiate(): THREE.Object3D {
    const group = new THREE.Group();
    group.name = this.name;

    for (const child of this.getChildren()) {
      group.add(child.instantiate());
    }

    return group;
  }

  public cloneNode(): IPrimitiveNode {
    const clone = new PrimitiveComposite(this.name);

    for (const child of this.getChildren()) {
      clone.add(child.cloneNode());
    }

    return clone;
  }
}

export class PrimitiveTreeSearch {
  public static findByName(
    root: IPrimitiveNode,
    name: string,
  ): IPrimitiveNode | null {
    if (root.name === name) {
      return root;
    }

    for (const child of root.getChildren()) {
      const found = PrimitiveTreeSearch.findByName(child, name);

      if (found !== null) {
        return found;
      }
    }

    return null;
  }
}

export class PrimitiveNodeFactory {
  public constructor(
    private readonly primitiveFactory: IPrimitiveFactory,
  ) {}

  public createPrimitive(
    name: string,
    request: IPrimitiveRequest,
  ): IPrimitiveNode {
    return new PrimitiveLeaf(name, request, this.primitiveFactory);
  }

  public createGroup(name: string): PrimitiveComposite {
    return new PrimitiveComposite(name);
  }
}