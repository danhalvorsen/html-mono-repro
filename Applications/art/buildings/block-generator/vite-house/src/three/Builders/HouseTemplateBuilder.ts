import * as THREE from "three";
import type { IPrimitiveNodeFactory } from "../IPrimitiveNodeFactory.js";
import { CompositeBuilder } from "./CompositeBuilder.js";
import type { IPrimitiveNode } from "@monorepo/core-design-pattern-composite-tree-threejs";
import { Box } from "./Box/box.js";
import { Cylinder } from "./Cylinder/Cylinder.js";

// =====================================================================================
// TEMPLATE BUILDERS
// =====================================================================================
export class HouseTemplateBuilder {
	public constructor(
		private readonly factory: IPrimitiveNodeFactory
	) { }

	public build(name: string): IPrimitiveNode {
		const body = this.buildBody(`${name}.Body`);
		const roof = this.buildRoof(`${name}.Roof`);
		const porch = this.buildPorch(`${name}.Porch`);
		const chimney = this.buildChimney(`${name}.Chimney`);

		return new CompositeBuilder(this.factory, name)
			.addNode("Body", body, {
				position: new THREE.Vector3(0, 0, 0),
			})
			.addNode("Roof", roof)
			.addNode("Porch", porch)
			.addNode("Chimney", chimney, {
				position: new THREE.Vector3(1.15, 4.0, -0.9),
			})
			.build();
	}

	private buildBody(name: string): IPrimitiveNode {
		return new CompositeBuilder(this.factory, name)
			.addBox(
				"Main",
				new Box(5.5, 2.8, 4.5),
				{
					position: new THREE.Vector3(0, 1.4, 0),
				}
			)
			.build();
	}

	private buildRoof(name: string): IPrimitiveNode {
		return new CompositeBuilder(this.factory, name)
			.addBox(
				"Left",
				new Box(2.95, 0.18, 4.8),
				{
					position: new THREE.Vector3(-1.38, 3.25, 0),
					rotation: new THREE.Euler(0, 0, THREE.MathUtils.degToRad(32)),
				}
			)
			.addBox(
				"Right",
				new Box(2.95, 0.18, 4.8),
				{
					position: new THREE.Vector3(1.38, 3.25, 0),
					rotation: new THREE.Euler(0, 0, THREE.MathUtils.degToRad(-32)),
				}
			)
			.addBox(
				"Ridge",
				new Box(0.18, 0.18, 4.9),
				{
					position: new THREE.Vector3(0, 3.82, 0),
				}
			)
			.build();
	}

	private buildPorch(name: string): IPrimitiveNode {
		return new CompositeBuilder(this.factory, name)
			.addBox(
				"Roof",
				new Box(1.8, 0.12, 1.4),
				{
					position: new THREE.Vector3(-1.25, 1.75, 2.75),
				}
			)
			.addCylinder(
				"Column.Left",
				new Cylinder(0.08, 0.08, 1.0, 16),
				{
					position: new THREE.Vector3(-1.85, 0.5, 2.95),
				}
			)
			.addCylinder(
				"Column.Right",
				new Cylinder(0.08, 0.08, 1.0, 16),
				{
					position: new THREE.Vector3(-0.65, 0.5, 2.95),
				}
			)
			.build();
	}

	private buildChimney(name: string): IPrimitiveNode {
		return new CompositeBuilder(this.factory, name)
			.addBox(
				"Body",
				new Box(0.45, 1.3, 0.45)
			)
			.addCylinder(
				"Pipe",
				new Cylinder(0.07, 0.07, 0.7, 16),
				{
					position: new THREE.Vector3(0, 0.95, 0),
				}
			)
			.build();
	}
}
