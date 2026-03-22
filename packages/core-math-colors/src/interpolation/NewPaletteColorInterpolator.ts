import type { IRangeBehavior } from "../range/IRangeBehavior.js";
import type { INewColorInterpolationSpace } from "./INewColorInterpolationSpace.js";
import type { INewColorInterpolator } from "./INewColorInterpolator.js";
import { NewPalette } from "../colors/NewPalette.js";

export class NewPaletteColorInterpolator<TColor> implements INewColorInterpolator<TColor> {
    private readonly palette: NewPalette<TColor>;
    private readonly rangeBehavior: IRangeBehavior;
    private readonly interpolationSpace: INewColorInterpolationSpace<TColor>;

    public constructor(
        palette: NewPalette<TColor>,
        rangeBehavior: IRangeBehavior,
        interpolationSpace: INewColorInterpolationSpace<TColor>
    ) {
        this.palette = palette;
        this.rangeBehavior = rangeBehavior;
        this.interpolationSpace = interpolationSpace;
    }

    public sample(position: number): TColor {
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

    public sampleMany(positions: readonly number[]): readonly TColor[] {
        return positions.map((position) => this.sample(position));
    }
}
