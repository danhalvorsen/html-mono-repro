import { IPoint } from "./IPoint.js";


export interface ITextFragment {
    readonly pageNumber: number;
    readonly text: string;
    readonly boundingBox: {
        readonly position: IPoint;
        readonly width: number;
        readonly height: number;
    };
}
