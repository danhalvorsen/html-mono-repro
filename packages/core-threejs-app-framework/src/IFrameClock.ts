export interface IFrameClock {
    update(timestamp?: number): void;
    getDelta(): number;
    getElapsedTime(): number;
}
