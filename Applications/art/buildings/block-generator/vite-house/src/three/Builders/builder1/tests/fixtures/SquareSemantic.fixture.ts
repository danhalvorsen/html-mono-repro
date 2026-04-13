// ============================================================================
// FILE: Applications/art/buildings/block-generator/vite-house/tests/Builders/builder1/fixtures/SquareSemantic.fixture.ts
// ============================================================================

import * as THREE from "three";

export type SquareSemantic =
  | "Left"
  | "Left.Top"
  | "Left.Mid"
  | "Left.Bottom"
  | "Top"
  | "Top.Left"
  | "Top.Mid"
  | "Top.Right"
  | "Bottom"
  | "Bottom.Left"
  | "Bottom.Mid"
  | "Bottom.Right"
  | "Right"
  | "Right.Top"
  | "Right.Mid"
  | "Right.Bottom";

export class SquareSemanticFixture {
  public quadAt(x: number, y: number): number[] {
    return [
      x - 0.5, y - 0.5, 0,
      x + 0.5, y - 0.5, 0,
      x + 0.5, y + 0.5, 0,
      x - 0.5, y + 0.5, 0,
    ];
  }

  public getLocalAnchor(semantic: SquareSemantic): THREE.Vector3 {
    switch (semantic) {
      case "Left":
      case "Left.Mid":
        return new THREE.Vector3(-0.5, 0, 0);

      case "Left.Top":
        return new THREE.Vector3(-0.5, 0.5, 0);

      case "Left.Bottom":
        return new THREE.Vector3(-0.5, -0.5, 0);

      case "Top":
      case "Top.Mid":
        return new THREE.Vector3(0, 0.5, 0);

      case "Top.Left":
        return new THREE.Vector3(-0.5, 0.5, 0);

      case "Top.Right":
        return new THREE.Vector3(0.5, 0.5, 0);

      case "Bottom":
      case "Bottom.Mid":
        return new THREE.Vector3(0, -0.5, 0);

      case "Bottom.Left":
        return new THREE.Vector3(-0.5, -0.5, 0);

      case "Bottom.Right":
        return new THREE.Vector3(0.5, -0.5, 0);

      case "Right":
      case "Right.Mid":
        return new THREE.Vector3(0.5, 0, 0);

      case "Right.Top":
        return new THREE.Vector3(0.5, 0.5, 0);

      case "Right.Bottom":
        return new THREE.Vector3(0.5, -0.5, 0);
    }
  }

  public getOppositeAnchor(semantic: SquareSemantic): SquareSemantic {
    switch (semantic) {
      case "Left":
      case "Left.Mid":
        return "Right.Mid";
      case "Left.Top":
        return "Right.Top";
      case "Left.Bottom":
        return "Right.Bottom";

      case "Right":
      case "Right.Mid":
        return "Left.Mid";
      case "Right.Top":
        return "Left.Top";
      case "Right.Bottom":
        return "Left.Bottom";

      case "Top":
      case "Top.Mid":
        return "Bottom.Mid";
      case "Top.Left":
        return "Bottom.Left";
      case "Top.Right":
        return "Bottom.Right";

      case "Bottom":
      case "Bottom.Mid":
        return "Top.Mid";
      case "Bottom.Left":
        return "Top.Left";
      case "Bottom.Right":
        return "Top.Right";
    }
  }
}