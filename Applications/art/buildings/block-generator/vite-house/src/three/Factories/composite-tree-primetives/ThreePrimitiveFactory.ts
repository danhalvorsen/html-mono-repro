import * as THREE from "three";
import type { IPrimitiveFactory } from "./IPrimitiveFactory";
import type { PrimitiveRequest } from "./PrimitiveRequest";
import { PrimitiveType } from "./PrimitiveType";

// =====================================================================================
// INFRASTRUCTURE
// =====================================================================================

export class ThreePrimitiveFactory implements IPrimitiveFactory {
	public create(request: PrimitiveRequest): THREE.Object3D {
		switch (request.type) {
			case PrimitiveType.Box:
				return new THREE.Mesh(
					new THREE.BoxGeometry(
						request.width,
						request.height,
						request.depth
					),
					new THREE.MeshStandardMaterial()
				);

			case PrimitiveType.Cylinder:
				return new THREE.Mesh(
					new THREE.CylinderGeometry(
						request.radius,
						request.radius,
						request.height,
						request.segments
					),
					new THREE.MeshStandardMaterial()
				);

			case PrimitiveType.HalfSphere:
				return new THREE.Mesh(
					new THREE.SphereGeometry(
						request.radius,
						request.segments,
						request.segments,
						0,
						Math.PI * 2,
						0,
						Math.PI / 2
					),
					new THREE.MeshStandardMaterial()
				);

			default: {
				const exhaustive: never = request;
				throw new Error(`Unsupported primitive request: ${JSON.stringify(exhaustive)}`);
			}
		}
	}
}
