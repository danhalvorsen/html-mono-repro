import { IFont } from "./IFont.js";


export class Font implements IFont {
    public readonly raw: unknown | null;
    public readonly name: string | null;
    public readonly family: string | null;
    public readonly size: number | null;

    private constructor(params: {
        raw: unknown | null;
        name: string | null;
        family: string | null;
        size: number | null;
    }) {
        this.raw = params.raw;
        this.name = params.name;
        this.family = params.family;
        this.size = params.size;
    }

    public static create(params?: {
        raw?: unknown;
        name?: string | null;
        family?: string | null;
        size?: number | null;
    }): Font {
        return new Font({
            raw: params?.raw ?? null,
            name: params?.name ?? null,
            family: params?.family ?? null,
            size: typeof params?.size === "number" && Number.isFinite(params.size)
                ? params.size
                : null,
        });
    }

    public withSize(size: number | null): Font {
        return Font.create({
            raw: this.raw,
            name: this.name,
            family: this.family,
            size,
        });
    }

    public toJSON(): IFont {
        return Object.freeze({
            raw: this.raw,
            name: this.name,
            family: this.family,
            size: this.size,
        });
    }
}
