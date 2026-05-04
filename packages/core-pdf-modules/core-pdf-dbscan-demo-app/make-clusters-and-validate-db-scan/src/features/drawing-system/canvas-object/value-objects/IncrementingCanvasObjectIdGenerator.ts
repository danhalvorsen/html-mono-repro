import type { ICanvasObjectIdGenerator } from "../contracts/ICanvasObjectIdGenerator.js";

export class IncrementingCanvasObjectIdGenerator implements ICanvasObjectIdGenerator {
    private nextValue: number;

    public constructor(seed: number = 1) {
        if (!Number.isInteger(seed) || seed <= 0) {
            throw new Error("seed must be a positive integer.");
        }

        this.nextValue = seed;
    }

    public nextId(): string {
        const value = this.nextValue;
        this.nextValue += 1;
        return `canvas-object-${value}`;
    }
}
