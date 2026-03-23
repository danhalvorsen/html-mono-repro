import * as THREE from "three";
import type { IPrimitiveNodeFactory } from "./IPrimitiveNodeFactory";
import type { IPrimitiveNode } from "./IPrimitiveNode";
import { CompositeBuilder } from "./CompositeBuilder";

export class PlazaTemplateBuilder {
	public constructor(
		private readonly factory: IPrimitiveNodeFactory
	) { }

	public build(name: string): IPrimitiveNode {
		return new CompositeBuilder(this.factory, name)
			.addBox(
				"Center",
				2.0,
				0.2,
				2.0,
				{
					position: new THREE.Vector3(0, 0.1, 0),
				}
			)
			.addCylinder(
				"Monument",
				0.25,
				1.6,
				16,
				{
					position: new THREE.Vector3(0, 0.8, 0),
				}
			)
			.build();
	}
}
