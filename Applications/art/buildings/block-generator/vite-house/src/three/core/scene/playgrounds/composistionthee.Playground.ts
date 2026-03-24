import * as THREE from "three";

import type { IPrimitiveFactory } from "../IPrimitiveFactory.js";
import type { IPrimitiveRequest } from "../IPrimitiveRequest.js";
import { PrimitiveType } from "../PrimitiveType.js";

// =====================================================================================
// SHARED CONTRACTS
// - Reuse the existing app-level PrimitiveType / IPrimitiveRequest / IPrimitiveFactory
// - Do NOT redefine parallel versions here
// =====================================================================================

export { PrimitiveType };
export type PrimitiveRequest = IPrimitiveRequest;

export interface ITransform {
  readonly position?: THREE.Vector3;
  readonly rotation?: THREE.Euler;
  readonly scale?: THREE.Vector3;
}

export interface IPrimitiveNode {
  readonly name: string;
  operation(): void;
  instantiate(): THREE.Object3D;
  cloneNode(): IPrimitiveNode;
  getChildren(): readonly IPrimitiveNode[];
}

export interface IPrimitiveCompositeNode extends IPrimitiveNode {
  add(child: IPrimitiveNode): this;
}

// =====================================================================================
// CORE NODES
// =====================================================================================

export class PrimitiveLeafNode implements IPrimitiveNode {
  public constructor(
    public readonly name: string,
    private readonly request: IPrimitiveRequest,
    private readonly primitiveFactory: IPrimitiveFactory,
  ) {}

  public operation(): void {
    // compatibility no-op
  }

  public instantiate(): THREE.Object3D {
    const instance = this.primitiveFactory.create(this.request);
    instance.name = this.name;
    return instance;
  }

  public cloneNode(): IPrimitiveNode {
    return new PrimitiveLeafNode(
      this.name,
      clonePrimitiveRequest(this.request),
      this.primitiveFactory,
    );
  }

  public getChildren(): readonly IPrimitiveNode[] {
    return [];
  }
}

export class PrimitiveCompositeNode implements IPrimitiveCompositeNode {
  private readonly children: IPrimitiveNode[] = [];

  public constructor(
    public readonly name: string,
    children?: readonly IPrimitiveNode[],
  ) {
    if (children !== undefined) {
      this.children.push(...children);
    }
  }

  public operation(): void {
    for (const child of this.children) {
      child.operation();
    }
  }

  public add(child: IPrimitiveNode): this {
    this.children.push(child);
    return this;
  }

  public instantiate(): THREE.Object3D {
    const group = new THREE.Group();
    group.name = this.name;

    for (const child of this.children) {
      group.add(child.instantiate());
    }

    return group;
  }

  public cloneNode(): IPrimitiveNode {
    return new PrimitiveCompositeNode(
      this.name,
      this.children.map((child) => child.cloneNode()),
    );
  }

  public getChildren(): readonly IPrimitiveNode[] {
    return this.children;
  }
}

export class TransformNode implements IPrimitiveNode {
  private readonly position: THREE.Vector3;
  private readonly rotation: THREE.Euler;
  private readonly scale: THREE.Vector3;

  public constructor(
    public readonly name: string,
    private readonly inner: IPrimitiveNode,
    transform?: ITransform,
  ) {
    this.position = transform?.position?.clone() ?? new THREE.Vector3(0, 0, 0);
    this.rotation = transform?.rotation?.clone() ?? new THREE.Euler(0, 0, 0);
    this.scale = transform?.scale?.clone() ?? new THREE.Vector3(1, 1, 1);
  }

  public operation(): void {
    this.inner.operation();
  }

  public instantiate(): THREE.Object3D {
    const instance = this.inner.instantiate();
    instance.name = this.name;
    instance.position.copy(this.position);
    instance.rotation.copy(this.rotation);
    instance.scale.copy(this.scale);
    return instance;
  }

  public cloneNode(): IPrimitiveNode {
    return new TransformNode(
      this.name,
      this.inner.cloneNode(),
      {
        position: this.position.clone(),
        rotation: this.rotation.clone(),
        scale: this.scale.clone(),
      },
    );
  }

  public getChildren(): readonly IPrimitiveNode[] {
    return [this.inner];
  }
}

// =====================================================================================
// SEARCH
// =====================================================================================

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

// =====================================================================================
// FACTORY
// =====================================================================================

export class PrimitiveNodeFactory {
  public constructor(
    private readonly primitiveFactory: IPrimitiveFactory,
  ) {}

  public createPrimitive(
    name: string,
    request: IPrimitiveRequest,
  ): IPrimitiveNode {
    return new PrimitiveLeafNode(name, request, this.primitiveFactory);
  }

  public createGroup(
    name: string,
    children?: readonly IPrimitiveNode[],
  ): PrimitiveCompositeNode {
    return new PrimitiveCompositeNode(name, children);
  }

  public createTransform(
    name: string,
    inner: IPrimitiveNode,
    transform?: ITransform,
  ): IPrimitiveNode {
    return new TransformNode(name, inner, transform);
  }

  public box(
    name: string,
    width: number,
    height: number,
    depth: number,
  ): IPrimitiveNode {
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
    segments = 16,
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
    segments = 16,
  ): IPrimitiveNode {
    return this.createPrimitive(name, {
      type: PrimitiveType.HalfSphere,
      radius,
      segments,
    });
  }
}

// Backward-compatible export for old imports
export { PrimitiveCompositeNode as PrimitiveComposite };

// =====================================================================================
// HELPERS
// =====================================================================================

function clonePrimitiveRequest(request: IPrimitiveRequest): IPrimitiveRequest {
  switch (request.type) {
    case PrimitiveType.Box:
      return {
        type: PrimitiveType.Box,
        width: request.width,
        height: request.height,
        depth: request.depth,
      };

    case PrimitiveType.Cylinder:
      return {
        type: PrimitiveType.Cylinder,
        radius: request.radius,
        height: request.height,
        segments: request.segments,
      };

    case PrimitiveType.HalfSphere:
      return {
        type: PrimitiveType.HalfSphere,
        radius: request.radius,
        segments: request.segments,
      };

    default: {
      const unsupported = request as never;
      throw new Error(`Unsupported primitive request: ${JSON.stringify(unsupported)}`);
    }
  }
}