import * as THREE from "three";
import type { IPrimitiveBuilder } from "./IPrimitiveBuilder";
import type { IPrimitiveRequest } from "./IPrimitiveRequest";
import  { PrimitiveType } from "./PrimitiveType";

// ====================================================================================
// EXTENDED PRIMITIVE TYPES
// - aligned with existing PrimitiveType
// - no test-fixture/container leakage
// ====================================================================================

export class ExtendedPrimitiveType {
  public static readonly Plane = PrimitiveType.create("plane");
  public static readonly Torus = PrimitiveType.create("torus");
  public static readonly TorusKnot = PrimitiveType.create("torus-knot");
  public static readonly Capsule = PrimitiveType.create("capsule");
  public static readonly Ring = PrimitiveType.create("ring");
  public static readonly Circle = PrimitiveType.create("circle");
  public static readonly Dodecahedron = PrimitiveType.create("dodecahedron");
  public static readonly Icosahedron = PrimitiveType.create("icosahedron");
  public static readonly Octahedron = PrimitiveType.create("octahedron");

  private constructor() {}
}

// ====================================================================================
// SHARED MATERIAL FACTORY
// - builders return fresh Mesh instances
// - material instance may be shared safely if you want uniform styling
// ====================================================================================

const sharedMaterial = new THREE.MeshStandardMaterial({
  color: 0x808080,
  roughness: 0.7,
  metalness: 0.1,
});

function createMesh(geometry: THREE.BufferGeometry): THREE.Mesh {
  return new THREE.Mesh(geometry, sharedMaterial);
}

// ====================================================================================
// BUILDERS
// - each build() returns a NEW Object3D instance
// - no cached Mesh/Object3D reuse
// ====================================================================================

export class PlaneBuilder implements IPrimitiveBuilder {
  public readonly type = ExtendedPrimitiveType.Plane;

  public build(request: IPrimitiveRequest): THREE.Object3D {
    const segments = request.segments ?? 1;

    return createMesh(
      new THREE.PlaneGeometry(
        request.width ?? 1,
        request.height ?? 1,
        segments,
        segments,
      ),
    );
  }
}

export class TorusBuilder implements IPrimitiveBuilder {
  public readonly type = ExtendedPrimitiveType.Torus;

  public build(request: IPrimitiveRequest): THREE.Object3D {
    const radius = request.radius ?? 1;
    const segments = request.segments ?? 16;

    return createMesh(
      new THREE.TorusGeometry(
        radius,
        radius * 0.3,
        Math.max(3, segments),
        Math.max(8, segments * 2),
      ),
    );
  }
}

export class TorusKnotBuilder implements IPrimitiveBuilder {
  public readonly type = ExtendedPrimitiveType.TorusKnot;

  public build(request: IPrimitiveRequest): THREE.Object3D {
    const radius = request.radius ?? 1;
    const segments = request.segments ?? 64;

    return createMesh(
      new THREE.TorusKnotGeometry(
        radius,
        radius * 0.3,
        Math.max(8, segments),
        8,
      ),
    );
  }
}

export class CapsuleBuilder implements IPrimitiveBuilder {
  public readonly type = ExtendedPrimitiveType.Capsule;

  public build(request: IPrimitiveRequest): THREE.Object3D {
    const segments = request.segments ?? 8;

    return createMesh(
      new THREE.CapsuleGeometry(
        request.radius ?? 0.5,
        request.height ?? 1,
        Math.max(2, segments),
        Math.max(4, segments * 2),
      ),
    );
  }
}

export class RingBuilder implements IPrimitiveBuilder {
  public readonly type = ExtendedPrimitiveType.Ring;

  public build(request: IPrimitiveRequest): THREE.Object3D {
    const radius = request.radius ?? 1;

    return createMesh(
      new THREE.RingGeometry(
        radius * 0.5,
        radius,
        request.segments ?? 32,
      ),
    );
  }
}

export class CircleBuilder implements IPrimitiveBuilder {
  public readonly type = ExtendedPrimitiveType.Circle;

  public build(request: IPrimitiveRequest): THREE.Object3D {
    return createMesh(
      new THREE.CircleGeometry(
        request.radius ?? 1,
        request.segments ?? 32,
      ),
    );
  }
}

export class DodecahedronBuilder implements IPrimitiveBuilder {
  public readonly type = ExtendedPrimitiveType.Dodecahedron;

  public build(request: IPrimitiveRequest): THREE.Object3D {
    return createMesh(
      new THREE.DodecahedronGeometry(request.radius ?? 1),
    );
  }
}

export class IcosahedronBuilder implements IPrimitiveBuilder {
  public readonly type = ExtendedPrimitiveType.Icosahedron;

  public build(request: IPrimitiveRequest): THREE.Object3D {
    return createMesh(
      new THREE.IcosahedronGeometry(request.radius ?? 1),
    );
  }
}

export class OctahedronBuilder implements IPrimitiveBuilder {
  public readonly type = ExtendedPrimitiveType.Octahedron;

  public build(request: IPrimitiveRequest): THREE.Object3D {
    return createMesh(
      new THREE.OctahedronGeometry(request.radius ?? 1),
    );
  }
}

