// ============================================================================
// FILE: src/three/Factories/IPrimitiveNodeFactory.ts
// PURPOSE: Request-free, OCP-safe factory contract
// ============================================================================

import type { ITransform } from "@monorepo/core-math";
import type {
  IPrimitiveNode,
  IPrimitiveCompositeNode,
} from "../scene/playgrounds/composistionthee.Playground";

// -----------------------------------------------------------------------------
// DESCRIPTOR (no request object, no DTO leakage)
// -----------------------------------------------------------------------------

export interface IPrimitiveDescriptor {
  readonly kind: string;
}

// Optional: strongly-typed union if you want stricter compile-time safety
export type PrimitiveDescriptor = IPrimitiveDescriptor;

// -----------------------------------------------------------------------------
// FACTORY CONTRACT
// -----------------------------------------------------------------------------

export interface IPrimitiveNodeFactory {
  /**
   * Creates a primitive node using a descriptor.
   * The factory resolves the correct builder based on descriptor.kind.
   */
  createPrimitive(
    name: string,
    descriptor: PrimitiveDescriptor,
  ): IPrimitiveNode;

  /**
   * Creates a composite/group node.
   */
  createGroup(
    name: string,
    children?: readonly IPrimitiveNode[],
  ): IPrimitiveCompositeNode;

  /**
   * Wraps a node in a transform node.
   */
  createTransform(
    name: string,
    inner: IPrimitiveNode,
    transform?: ITransform,
  ): IPrimitiveNode;
}