import { IRandomSource } from "../../domain/value-objects/Probability.js";

export class CachedStandardNormalSource {
    private spare: number | null = null;

    public constructor(private readonly random: IRandomSource) { }

    public next(): number {
        if (this.spare !== null) {
            const result = this.spare;
            this.spare = null;
            return result;
        }

        let u1 = 0;
        do {
            u1 = this.random.next();
        } while (u1 <= Number.EPSILON);

        const u2 = this.random.next();

        const radius = Math.sqrt(-2 * Math.log(u1));
        const theta = 2 * Math.PI * u2;

        const z0 = radius * Math.cos(theta);
        const z1 = radius * Math.sin(theta);

        this.spare = z1;
        return z0;
    }
}
