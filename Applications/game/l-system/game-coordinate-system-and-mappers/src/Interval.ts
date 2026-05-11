import type { IInterval } from './IInterval';


export class Interval implements IInterval {
    min: number;
    max: number;

    constructor(min: number, max: number) {
        this.min = min;
        this.max = max;
    }

    setMin(min: number): void { this.min = min; }
    setMax(max: number): void { this.max = max; }
    setInterval(interval: IInterval): void {
        this.min = interval.min;
        this.max = interval.max;
    }
}
