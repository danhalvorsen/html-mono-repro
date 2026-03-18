import type { IUpdatable } from "../IUpdatable";

export class BuildingWithBuilder implements IUpdatable {
    update(_deltaSeconds: number, _elapsedSeconds: number): void {
        throw new Error("Method not implemented.");
    }
    
}