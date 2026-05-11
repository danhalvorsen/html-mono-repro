import { Vector2 } from "@monorepo/core-math";
import "./ScannerGameObject.js";
import { ScannerGameObject, type ScannerTarget } from "./ScannerGameObject.js";

export interface CreateMouseTrackingScannerOptions {
  readonly mousePointer: ScannerTarget;
  readonly triggerDistance: number;
  readonly particleLifeTimeSeconds: number;
  readonly particleStartVelocity: Vector2;
  readonly particleAccelerationScale: number;
}

export function createMouseTrackingScanner(
  options: CreateMouseTrackingScannerOptions,
): ScannerGameObject {
  const scanner = document.createElement("scanner-game-object");

  scanner.mousePointer = options.mousePointer;
  scanner.triggerDistance = options.triggerDistance;
  scanner.particleLifeTimeSeconds = options.particleLifeTimeSeconds;
  scanner.particleStartVelocity = options.particleStartVelocity;
  scanner.particleAccelerationScale = options.particleAccelerationScale;

  return scanner;
}