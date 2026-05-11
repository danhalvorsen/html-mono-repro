import type { IInterval } from './IInterval';

export interface IAxis {
      setInterval(interval: IInterval): void
      getInterval(): IInterval;
}

export class Axis implements IAxis {
    private interval: IInterval;

    constructor(interval: IInterval) {
        this.interval = interval;
    }
    getInterval(): IInterval {
        return this.interval;
    }
  
    setInterval(interval: IInterval): void{ this.interval.setInterval(interval); }

}
