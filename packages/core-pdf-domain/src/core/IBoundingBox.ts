import { IPosition } from "./IPosition.js";

export interface IBoundingBox {
    position: { x: number; y: number };
    width: number;
    height: number;
}