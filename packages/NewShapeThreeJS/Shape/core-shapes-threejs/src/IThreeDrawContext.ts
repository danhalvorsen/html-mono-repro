import { Scene } from "three/src/Three.js";

// ============================================================================
// Contracts
// ============================================================================
export interface IThreeDrawContext {
    readonly scene: Scene;
}
