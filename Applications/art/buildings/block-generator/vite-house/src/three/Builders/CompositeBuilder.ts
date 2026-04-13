import type {
  IPrimitiveNodeFactory,
} from "../IPrimitiveNodeFactory.js";
import type {
  INodeTransform,
  IPrimitiveCompositeNode,
  IPrimitiveNode,
} from "@monorepo/core-design-pattern-composite-tree-threejs";
import type { IBox } from "./Box/box.js";
import type { ICylinder } from "./Cylinder/Cylinder.js";
import type { IHalfSphere } from "./HalfSphere/HalfSphere.js";

// =====================================================================================
// SHARED COMPOSITE BUILDER
// =====================================================================================
export class CompositeBuilder {
  private readonly group: IPrimitiveCompositeNode;

  public constructor(
    private readonly factory: IPrimitiveNodeFactory,
    private readonly name: string,
  ) {
    this.group = this.factory.createGroup(name);
  }

  public addNode(
    localName: string,
    node: IPrimitiveNode,
    transform?: INodeTransform,
  ): this {
    this.group.add(
      this.factory.createTransform(
        `${this.name}.${localName}.Instance`,
        node,
        transform,
      ),
    );

    return this;
  }

  public addClone(
    localName: string,
    template: IPrimitiveNode,
    transform?: INodeTransform,
  ): this {
    return this.addNode(localName, template.cloneNode(), transform);
  }

  public addBox(
    localName: string,
    configuration: IBox,
    transform?: INodeTransform,
  ): this {
    return this.addNode(
      localName,
      this.factory.box(`${this.name}.${localName}`, configuration),
      transform,
    );
  }

  public addCylinder(
    localName: string,
    configuration: ICylinder,
    transform?: INodeTransform,
  ): this {
    return this.addNode(
      localName,
      this.factory.cylinder(`${this.name}.${localName}`, configuration),
      transform,
    );
  }

  public addHalfSphere(
    localName: string,
    configuration: IHalfSphere,
    transform?: INodeTransform,
  ): this {
    return this.addNode(
      localName,
      this.factory.halfSphere(`${this.name}.${localName}`, configuration),
      transform,
    );
  }

  public build(): IPrimitiveNode {
    return this.group;
  }
}
