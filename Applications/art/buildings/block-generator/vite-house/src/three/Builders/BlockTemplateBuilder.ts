import * as THREE from "three";
 
import { HouseTemplateBuilder } from "./HouseTemplateBuilder.js";
import { PlazaTemplateBuilder } from "../PlazaTemplateBuilder.js";
import type { TowerTemplateBuilder } from "./TowerTemplateBuilder.js";
import type { IPrimitiveNode } from "@monorepo/core-design-pattern-composite-tree-threejs";
import type { IPrimitiveNodeFactory } from "../IPrimitiveNodeFactory.js";
import { CompositeBuilder } from "./CompositeBuilder.js";
 
export class BlockTemplateBuilder {
	public constructor(
		private readonly factory: IPrimitiveNodeFactory,
		private readonly houseBuilder: HouseTemplateBuilder,
		private readonly towerBuilder: TowerTemplateBuilder,
		private readonly plazaBuilder: PlazaTemplateBuilder
	) { }

	public build(name: string): IPrimitiveNode {
		const house = this.houseBuilder.build("Template.House");
		const tower = this.towerBuilder.build("Template.Tower");
		const plaza = this.plazaBuilder.build("Template.Plaza");

		return new CompositeBuilder(this.factory, name)
			.addClone(
				"House.A",
				house,
				{
					position: new THREE.Vector3(-5, 0, -4),
				}
			)
			.addClone(
				"House.B",
				house,
				{
					position: new THREE.Vector3(0, 0, -4),
				}
			)
			.addClone(
				"House.C",
				house,
				{
					position: new THREE.Vector3(5, 0, -4),
				}
			)
			.addClone(
				"Tower",
				tower,
				{
					position: new THREE.Vector3(0, 0, 4),
				}
			)
			.addClone(
				"Plaza",
				plaza,
				{
					position: new THREE.Vector3(0, 0, 0),
				}
			)
			.build();
	}
}
