import type { IPrimitiveFactory } from "./IPrimitiveFactory.js";
import type { IPrimitiveCompositeNode } from "./IPrimitiveCompositeNode.js";
import type { IPrimitiveNode } from "./IPrimitiveNode.js";
import type { IPrimitiveNodeFactory } from "./IPrimitiveNodeFactory.js";
import type { ITransform } from "./ITransform.js";
import type { PrimitiveRequest } from "./PrimitiveRequest.js";

import { PrimitiveType } from "./PrimitiveType.js";
import { PrimitiveCompositeNode } from "./PrimitiveCompositeNode.js";
import { PrimitiveLeafNode } from "./PrimitiveLeafNode.js";
import { TransformNode } from "./TransformNode.js";

// =====================================================================================
// NODE FACTORY
// =====================================================================================
export class PrimitiveNodeFactory implements IPrimitiveNodeFactory {
  public constructor(
    private readonly primitiveFactory: IPrimitiveFactory,
  ) {}

  public createPrimitive(name: string, request: PrimitiveRequest): IPrimitiveNode {
    return new PrimitiveLeafNode(name, request, this.primitiveFactory);
  }

  public createGroup(
    name: string,
    children?: readonly IPrimitiveNode[],
  ): IPrimitiveCompositeNode {
    return new PrimitiveCompositeNode(name, children);
  }

  public createTransform(
    name: string,
    inner: IPrimitiveNode,
    transform?: ITransform,
  ): IPrimitiveNode {
    return new TransformNode(name, inner, transform);
  }

  public box(name: string, width: number, height: number, depth: number): IPrimitiveNode {
    return this.createPrimitive(name, {
      type: PrimitiveType.Box,
      width,
      height,
      depth,
    });
  }

  public cylinder(
    name: string,
    radius: number,
    height: number,
    segments: number = 16,
  ): IPrimitiveNode {
    return this.createPrimitive(name, {
      type: PrimitiveType.Cylinder,
      radius,
      height,
      segments,
    });
  }

  public halfSphere(
    name: string,
    radius: number,
    segments: number = 16,
  ): IPrimitiveNode {
    return this.createPrimitive(name, {
      type: PrimitiveType.HalfSphere,
      radius,
      segments,
    });
  }
}