import {
    type IPlacementZoneId
} from "../../src/index.js";


export class PlacementZoneIdFixture implements IPlacementZoneId {
    public readonly value: string;

    public constructor(value: string) {
        this.value = value;
    }
}
