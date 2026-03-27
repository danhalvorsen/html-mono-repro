export interface ICylinder {
    readonly radiusTop: number;
    readonly radiusBottom: number;
    readonly height: number;
    readonly radialSegments: number;
}
export declare class Cylinder implements ICylinder {
    readonly radiusTop: number;
    readonly radiusBottom: number;
    readonly height: number;
    readonly radialSegments: number;
    constructor(radiusTop: number, radiusBottom: number, height: number, radialSegments?: number);
}
//# sourceMappingURL=Cylinder.d.ts.map