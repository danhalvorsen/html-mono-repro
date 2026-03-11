/* ============================================================================

   MODULE: car-composite-tree.ts
   Purpose:
     Example module that depends on `core-composite-tree-abstract` and builds a
     vehicle parts composite tree from JSON. Vehicles (e.g., cars) are built
     from selections within this tree.

   NOTE:
     The following import assumes your workspace module:
       packages/composite-tree-system/Tree/core-composite-tree-abstract

     In your monorepo this would typically be:
       import { CompositeNode, LeafNode, type INode } 
       from "@monorepo/core-composite-tree-abstract";

   ============================================================================ */

import {
  CompositeNode,
  LeafNode,
  type INode
} from "@monorepo/core-composite-tree-abstract";

/* ============================================================================
   JSON Contracts
   ============================================================================ */

export type PartId = number;

export type PartKind =
  | "category"
  | "system"
  | "assembly"
  | "part";

export interface IPartJson {
  id: PartId;
  name: string;
  kind: PartKind;
  tags?: readonly string[];
  children?: readonly IPartJson[];
}

export interface IPartsCatalogJson {
  version: 1;
  root: IPartJson;
}

/* ============================================================================
   Tree Node Interface
   ============================================================================ */

export interface ICarPartNode extends INode<ICarPartNode> {
  readonly partId: PartId;
  readonly name: string;
  readonly kind: PartKind;
  readonly tags: readonly string[];

  isLeaf(): boolean;
}

/* ============================================================================
   Leaf Node
   ============================================================================ */

export class CarPartLeafNode
  extends LeafNode<ICarPartNode>
  implements ICarPartNode
{
  public constructor(
    public readonly partId: PartId,
    public readonly name: string,
    public readonly kind: PartKind,
    public readonly tags: readonly string[] = []
  ) {
    super(partId.toString());
  }

  public isLeaf(): boolean {
    return true;
  }
}

/* ============================================================================
   Composite Node
   ============================================================================ */

export class CarPartCompositeNode
  extends CompositeNode<ICarPartNode>
  implements ICarPartNode
{
  public constructor(
    public readonly partId: PartId,
    public readonly name: string,
    public readonly kind: PartKind,
    public readonly tags: readonly string[] = [],
    children: readonly ICarPartNode[] = []
  ) {
    super(partId.toString(), children);
  }

  public isLeaf(): boolean {
    return false;
  }
}

/* ============================================================================
   Tree Factory (JSON → Composite Tree)
   ============================================================================ */

export interface ICarPartTreeFactory {
  create(source: IPartsCatalogJson): ICarPartNode;
}

export class CarPartTreeFactory implements ICarPartTreeFactory {

  public create(source: IPartsCatalogJson): ICarPartNode {
    const seen = new Set<number>();
    return this.createNode(source.root, seen);
  }

  private createNode(source: IPartJson, seen: Set<number>): ICarPartNode {

    if (seen.has(source.id)) {
      throw new Error(`Duplicate part id '${source.id}'.`);
    }

    seen.add(source.id);

    const tags = Object.freeze([...(source.tags ?? [])]);
    const children = source.children ?? [];

    if (children.length === 0) {
      return new CarPartLeafNode(
        source.id,
        source.name,
        source.kind,
        tags
      );
    }

    const node = new CarPartCompositeNode(
      source.id,
      source.name,
      source.kind,
      tags
    );

    for (const child of children) {
      node.add(this.createNode(child, seen));
    }

    return node;
  }
}

/* ============================================================================
   Tree Query Helpers
   ============================================================================ */

export class CarPartTreeQuery {

  public findByPartId(
    root: ICarPartNode,
    partId: PartId
  ): ICarPartNode | null {

    if (root.partId === partId) {
      return root;
    }

    for (const child of root.children) {
      const found = this.findByPartId(child, partId);
      if (found !== null) {
        return found;
      }
    }

    return null;
  }

  public flatten(root: ICarPartNode): readonly ICarPartNode[] {
    const result: ICarPartNode[] = [];
    this.visit(root, result);
    return result;
  }

  private visit(node: ICarPartNode, result: ICarPartNode[]): void {

    result.push(node);

    for (const child of node.children) {
      this.visit(child, result);
    }
  }
}

/* ============================================================================
   Catalog (mutable tree)
   ============================================================================ */

export interface ICarPartCatalog {

  readonly root: ICarPartNode;

  find(partId: PartId): ICarPartNode | null;

  addPart(parentPartId: PartId, part: IPartJson): void;

  removePart(partId: PartId): void;
}

export class CarPartCatalog implements ICarPartCatalog {

  private readonly query = new CarPartTreeQuery();
  private readonly _root: ICarPartNode;

  public constructor(source: IPartsCatalogJson) {

    const factory = new CarPartTreeFactory();
    this._root = factory.create(source);
  }

  public get root(): ICarPartNode {
    return this._root;
  }

  public find(partId: PartId): ICarPartNode | null {
    return this.query.findByPartId(this._root, partId);
  }

  public addPart(parentPartId: PartId, part: IPartJson): void {

    const parent = this.find(parentPartId);

    if (!parent) {
      throw new Error(`Parent part '${parentPartId}' not found.`);
    }

    if (parent.isLeaf()) {
      throw new Error(`Cannot add child to leaf '${parentPartId}'.`);
    }

    const compositeParent = parent as CarPartCompositeNode;

    const node = new CarPartTreeFactory().create({
      version: 1,
      root: part
    });

    compositeParent.add(node);
  }

  public removePart(partId: PartId): void {

    if (this._root.partId === partId) {
      throw new Error("Cannot remove root.");
    }

    const node = this.find(partId);

    if (!node) {
      throw new Error(`Part '${partId}' not found.`);
    }

    const parent = node.parent as CarPartCompositeNode | null;

    if (!parent) {
      throw new Error("Parent missing.");
    }

    parent.remove(node);
  }
}

/* ============================================================================
   Vehicle Domain Objects
   ============================================================================ */

export type VehicleKind =
  | "car"
  | "truck"
  | "bus"
  | "motorcycle";

export interface IVehicle {
  readonly kind: VehicleKind;
  readonly name: string;
  readonly parts: readonly PartId[];
}

export class Vehicle implements IVehicle {

  public constructor(
    public readonly kind: VehicleKind,
    public readonly name: string,
    public readonly parts: readonly PartId[]
  ) {}
}

export class Car extends Vehicle {

  public constructor(name: string, parts: readonly PartId[]) {
    super("car", name, parts);
  }
}

/* ============================================================================
   Vehicle Recipe
   ============================================================================ */

export class VehicleRecipe {

  public constructor(
    public readonly kind: VehicleKind,
    public readonly name: string,
    public readonly partIds: readonly PartId[]
  ) {}
}

/* ============================================================================
   Vehicle Builder
   ============================================================================ */

export class VehicleBuilder {

  public build(
    recipe: VehicleRecipe,
    catalog: ICarPartCatalog
  ): Vehicle {

    const uniqueParts = [...new Set(recipe.partIds)];

    for (const partId of uniqueParts) {

      if (!catalog.find(partId)) {
        throw new Error(`Part '${partId}' not found.`);
      }
    }

    if (recipe.kind === "car") {

      this.ensureCarMinimum(uniqueParts);

      return new Car(recipe.name, uniqueParts);
    }

    return new Vehicle(recipe.kind, recipe.name, uniqueParts);
  }

  private ensureCarMinimum(parts: readonly PartId[]): void {

    const required = [11, 12, 13, 14];

    for (const r of required) {
      if (!parts.includes(r)) {
        throw new Error(`Car missing required system '${r}'.`);
      }
    }
  }
}

/* ============================================================================
   Example JSON
   ============================================================================ */

export const examplePartsJson: IPartsCatalogJson = {

  version: 1,

  root: {
    id: 1,
    name: "Vehicle",
    kind: "category",

    children: [

      {
        id: 11,
        name: "Chassis",
        kind: "system",

        children: [
          { id: 111, name: "Frame", kind: "part" },
          { id: 112, name: "Suspension", kind: "assembly" }
        ]
      },

      {
        id: 12,
        name: "Powertrain",
        kind: "system",

        children: [
          {
            id: 121,
            name: "Engine",
            kind: "assembly",

            children: [
              { id: 1211, name: "Cylinder block", kind: "part" },
              { id: 1212, name: "Pistons", kind: "part" }
            ]
          }
        ]
      },

      {
        id: 13,
        name: "Body",
        kind: "system",

        children: [
          { id: 131, name: "Body shell", kind: "part" }
        ]
      },

      {
        id: 14,
        name: "Electrical",
        kind: "system",

        children: [
          { id: 141, name: "Battery", kind: "part" }
        ]
      }

    ]
  }
};

/* ============================================================================
   Usage Example
   ============================================================================ */

const catalog = new CarPartCatalog(examplePartsJson);

catalog.addPart(121, {
  id: 1213,
  name: "Spark plugs",
  kind: "part"
});

const builder = new VehicleBuilder();

const myCar = builder.build(
  new VehicleRecipe("car", "Roadster", [11, 12, 13, 14, 121]),
  catalog
);

console.log(myCar);