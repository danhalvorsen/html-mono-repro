import { type NewGradientStop } from  "./NewGradientStop.js";

export interface INewGradient<TColor> {
    readonly name: string;
    readonly count: number;

    getAt(index: number): NewGradientStop<TColor>;
    getAll(): readonly NewGradientStop<TColor>[];
}
