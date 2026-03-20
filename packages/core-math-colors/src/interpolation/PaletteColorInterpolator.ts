// ====================================================================================
// FILE: src/interpolation/IColorInterpolator.ts
// ====================================================================================
import { Color } from "../colors/Color.js";
import { Palette } from "../colors/Palette.js";
import { IRangeBehavior } from "../range/IRangeBehavior.js";
import { IColorInterpolationSpace } from "./IColorInterpolationSpace.js";
import { IColorInterpolator } from "./IColorInterpolator.js";


export class PaletteColorInterpolator implements IColorInterpolator {
    private readonly palette: Palette;
    private readonly rangeBehavior: IRangeBehavior;
    private readonly interpolationSpace: IColorInterpolationSpace;

    public constructor(
        palette: Palette,
        rangeBehavior: IRangeBehavior,
        interpolationSpace: IColorInterpolationSpace
    ) {
        this.palette = palette;
        this.rangeBehavior = rangeBehavior;
        this.interpolationSpace = interpolationSpace;
    }

    public sample(position: number): Color {
        const normalized = this.rangeBehavior.normalize(position);

        if (this.palette.count === 1) {
            return this.palette.getAt(0);
        }

        if (normalized === 1) {
            return this.palette.getAt(this.palette.count - 1);
        }

        const segmentCount = this.palette.count - 1;
        const scaled = normalized * segmentCount;
        const startIndex = Math.floor(scaled);
        const localAmount = scaled - startIndex;

        const start = this.palette.getAt(startIndex);
        const end = this.palette.getAt(startIndex + 1);

        return this.interpolationSpace.interpolate(start, end, localAmount);
    }

    public sampleMany(positions: readonly number[]): readonly Color[] {
        return positions.map((position) => this.sample(position));
    }
}
