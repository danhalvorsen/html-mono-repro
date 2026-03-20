import { IRangeBehavior } from "./IRangeBehavior.js";

export class WrapRangeBehavior implements IRangeBehavior {
    public normalize(position: number): number {
        if (!Number.isFinite(position)) {
            throw new Error(`Sample position must be finite. Received '${position}'.`);
        }

        const wrapped = position - Math.floor(position);

        return wrapped === 1 ? 0 : wrapped;
    }
}
