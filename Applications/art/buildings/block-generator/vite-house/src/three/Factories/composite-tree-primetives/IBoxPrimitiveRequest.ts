import type { PrimitiveType } from "./PrimitiveType";


export interface IBoxPrimitiveRequest {
	readonly type: PrimitiveType.Box;
	readonly width: number;
	readonly height: number;
	readonly depth: number;
}
