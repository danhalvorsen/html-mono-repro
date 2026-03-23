import * as THREE from "three";
import { clonePrimitiveRequest } from "./clonePrimitiveRequest";
import type { IPrimitiveFactory } from "./IPrimitiveFactory";
import type { IPrimitiveNode } from "./IPrimitiveNode";

// =====================================================================================
// CORE NODES
// =====================================================================================

export class PrimitiveLeafNode implements IPrimitiveNode {
	public constructor(
		public readonly name: string,
		private readonly request: IPrimitiveRequest,
		private readonly primitiveFactory: IPrimitiveFactory
	) { }

	public operation(): void {
		// compatibility no-op
	}

	public instantiate(): THREE.Object3D {
		const instance = this.primitiveFactory.create(this.request);
		instance.name = this.name;
		return instance;
	}

	public cloneNode(): IPrimitiveNode {
		return new PrimitiveLeafNode(
			this.name,
			clonePrimitiveRequest(this.request),
			this.primitiveFactory
		);
	}

	public getChildren(): readonly IPrimitiveNode[] {
		return [];
	}
}
