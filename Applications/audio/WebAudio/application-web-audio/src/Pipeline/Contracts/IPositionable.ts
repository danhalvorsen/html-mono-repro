import { Point } from "@monorepo/core-math";


export interface IPositionable {
    getPosition(): Point;
    setPosition(position: Point): void;
}
