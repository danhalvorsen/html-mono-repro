import type { ICanvasObjectFactory } from "./ICanvasObjectFactory.js";
import type { ICanvasObjectIdGenerator } from "../contracts/ICanvasObjectIdGenerator.js";
import type { ICanvasObjectBuilder } from "../builders/ICanvasObjectBuilder.js";
import type { CanvasObjectKind } from "../value-objects/CanvasObjectKind.js";
import type { ICanvasObject } from "../contracts/CanvasObject.js";

export class CanvasObjectFactory implements ICanvasObjectFactory {
    private readonly idGenerator: ICanvasObjectIdGenerator;
    private readonly builderFactory: () => ICanvasObjectBuilder;

    public constructor(
        idGenerator: ICanvasObjectIdGenerator,
        builderFactory: () => ICanvasObjectBuilder
    ) {
        this.idGenerator = idGenerator;
        this.builderFactory = builderFactory;
    }

    public createAtCell(kind: CanvasObjectKind, column: number, row: number): ICanvasObject {
        const builder = this.builderFactory();

        return builder
            .withId(this.idGenerator.nextId())
            .withKind(kind)
            .atCell(column, row)
            .build();
    }
}
