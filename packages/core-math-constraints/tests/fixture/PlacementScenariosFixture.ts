// ====================================================================================
// FILE: fixture/PlacementScenariosFixture.ts
// ====================================================================================

import { PlacementFixture } from "./PlacementFixture.js";

export class PlacementScenariosFixture {
  private readonly base = new PlacementFixture();

  public createValidPlacement() {
    const source = this.base.createSource(1, 1, 2, 2);
    const target = this.base.createTarget(0, 0, 10, 10);
    return this.base.createContext(source, target);
  }

  public createInvalidPlacement_OutOfBounds() {
    const source = this.base.createSource(9, 9, 2, 2);
    const target = this.base.createTarget(0, 0, 10, 10);
    return this.base.createContext(source, target);
  }

  public createTightFitPlacement() {
    const source = this.base.createSource(0, 0, 10, 10);
    const target = this.base.createTarget(0, 0, 10, 10);
    return this.base.createContext(source, target);
  }
}