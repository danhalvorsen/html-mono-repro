import * as THREE from "three";
import type { IPrimitiveNodeFactory } from "./IPrimitiveNodeFactory";
import type { IPrimitiveNode } from "./IPrimitiveNode";
import { CompositeBuilder } from "./CompositeBuilder";

export class TowerTemplateBuilder {
	public constructor(
		private readonly factory: IPrimitiveNodeFactory
	) { }

	public build(name: string): IPrimitiveNode {
		return new CompositeBuilder(this.factory, name)
			.addCylinder(
				"Core",
				0.75,
				5.0,
				20,
				{
					position: new THREE.Vector3(0, 2.5, 0),
				}
			)
			.addHalfSphere(
				"Dome",
				0.9,
				20,
				{
					position: new THREE.Vector3(0, 5.0, 0),
				}
			)
			.build();
	}
}
