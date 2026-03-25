import {
    type IPlaceholderId
} from "../../src/index.js";


export class PlaceholderIdFixture implements IPlaceholderId {
    public readonly value: string;

    public constructor(value: string) {
        this.value = value;
    }
}
