import type { IBoxPrimitiveRequest } from "./IBoxPrimitiveRequest";
import type { ICylinderPrimitiveRequest } from "./ICylinderPrimitiveRequest";
import type { IHalfSpherePrimitiveRequest } from "./IHalfSpherePrimitiveRequest";


export type PrimitiveRequest = IBoxPrimitiveRequest |
	ICylinderPrimitiveRequest |
	IHalfSpherePrimitiveRequest;
