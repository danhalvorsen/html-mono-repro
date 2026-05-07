import { Vector2 } from "@monorepo/core-math";
import type { InitialVelocityOptions } from "./InitialConditionsOptions.js";

export interface IInitialVelocityResolver {
  resolve(options: InitialVelocityOptions): Vector2;
}

export class InitialVelocityResolver implements IInitialVelocityResolver {
  public resolve(options: InitialVelocityOptions): Vector2 {
    if (!Number.isFinite(options.speed) || options.speed < 0) {
      throw new Error("initial velocity speed must be finite and >= 0.");
    }

    this.#validateVector(options.normalizedDirection, "normalizedDirection");

    return new Vector2(
      options.normalizedDirection.x * options.speed,
      options.normalizedDirection.y * options.speed,
    );
  }

  #validateVector(vector: Vector2, name: string): void {
    if (!Number.isFinite(vector.x) || !Number.isFinite(vector.y)) {
      throw new Error(`${name} must contain finite x and y values.`);
    }
  }
}
