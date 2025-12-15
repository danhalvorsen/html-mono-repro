// ============================================================================
// ReactiveController (DOM-free, Lit-like lifecycle)

import { Shape } from "./Shape.js";
import { ThreeLikeHost } from "./ThreeLikeHost.js";

// ============================================================================
// Example concrete Shape primitive (your backend-specific 3D object)
// ============================================================================
export class CubePrimitive extends Shape {
  protected render(): unknown {
    throw new Error("Method not implemented.");
  }
  rotationX = 0;
  rotationY = 0;
}

// ============================================================================
// Example usage
// ============================================================================
const host = new ThreeLikeHost();
host.addShape(new CubePrimitive());

// Simulate animation loop
setInterval(() => host.requestUpdate(), 16);

