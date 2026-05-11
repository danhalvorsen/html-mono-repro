
export interface IInterval {
    min: number;
    max: number;

    setMin(min: number): void;
    setMax(max: number): void;
    setInterval(interval: IInterval): void;
}
