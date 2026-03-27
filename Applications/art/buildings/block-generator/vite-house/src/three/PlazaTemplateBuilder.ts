import * as THREE from "three";
import type { IPrimitiveNodeFactory } from "./IPrimitiveNodeFactory.js";
import { CompositeBuilder } from "./Builders/CompositeBuilder.js";
import type { IPrimitiveNode } from "@monorepo/core-design-pattern-composite-tree-threejs";
import { Box } from "./Builders/Box/box.js";
import { Cylinder } from "./Builders/Cylinder/Cylinder.js";

export class PlazaTemplateBuilder {
	public constructor(
		private readonly factory: IPrimitiveNodeFactory
	) { }

	public build(name: string): IPrimitiveNode {
		return new CompositeBuilder(this.factory, name)
			.addBox(
				"Center",
				new Box(2.0, 0.2, 2.0),
				{
					position: new THREE.Vector3(0, 0.1, 0),
				}
			)
			.addCylinder(
				"Monument",
				new Cylinder(0.25, 0.25, 1.6, 16),
				{
					position: new THREE.Vector3(0, 0.8, 0),
				}
			)
			.build();
	}
}
