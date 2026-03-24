import type { PrimitiveType } from "./PrimitiveType";


export interface ICylinderPrimitiveRequest {
	readonly type: PrimitiveType.Cylinder;
	readonly radius: number;
	readonly height: number;
	readonly segments: number;
}
