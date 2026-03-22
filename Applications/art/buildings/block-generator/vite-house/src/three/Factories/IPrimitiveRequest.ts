import type { IPrimitiveType } from "./IPrimitiveType";


export interface IPrimitiveRequest {
    readonly type: IPrimitiveType;
    readonly width?: number;
    readonly height?: number;
    readonly depth?: number;
    readonly radius?: number;
    readonly segments?: number;
}
