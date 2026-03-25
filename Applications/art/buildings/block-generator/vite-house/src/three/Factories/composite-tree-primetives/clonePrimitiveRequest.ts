 
import type { PrimitiveRequest } from "./PrimitiveRequest";
import { PrimitiveType } from "./PrimitiveType";

// =====================================================================================
// HELPERS
// =====================================================================================
export function clonePrimitiveRequest(request: PrimitiveRequest): PrimitiveRequest {
	switch (request.type) {
		case PrimitiveType.Box:
			return {
				type: PrimitiveType.Box,
				width: request.width,
				height: request.height,
				depth: request.depth,
			};

		case PrimitiveType.Cylinder:
			return {
				type: PrimitiveType.Cylinder,
				radius: request.radius,
				height: request.height,
				segments: request.segments,
			};

		case PrimitiveType.HalfSphere:
			return {
				type: PrimitiveType.HalfSphere,
				radius: request.radius,
				segments: request.segments,
			};

		default: {
			const exhaustive: never = request;
			throw new Error(`Unsupported primitive request clone: ${JSON.stringify(exhaustive)}`);
		}
	}
}
