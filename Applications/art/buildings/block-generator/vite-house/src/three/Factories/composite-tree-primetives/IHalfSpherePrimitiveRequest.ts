import type { PrimitiveType } from "./PrimitiveType";


export interface IHalfSpherePrimitiveRequest {
	readonly type: PrimitiveType.HalfSphere;
	readonly radius: number;
	readonly segments: number;
}
