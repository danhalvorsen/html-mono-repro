import * as THREE from "three";
import type { BlockTemplateBuilder } from "./BlockTemplateBuilder";
import type { IPrimitiveNodeFactory } from "./IPrimitiveNodeFactory";
import type { IPrimitiveNode } from "./IPrimitiveNode";
import { CompositeBuilder } from "./CompositeBuilder";

export class DistrictTemplateBuilder {
	public constructor(
		private readonly factory: IPrimitiveNodeFactory,
		private readonly blockBuilder: BlockTemplateBuilder
	) { }

	public build(name: string): IPrimitiveNode {
		const block = this.blockBuilder.build("Template.Block");

		return new CompositeBuilder(this.factory, name)
			.addClone(
				"Block.01",
				block,
				{
					position: new THREE.Vector3(-12, 0, -12),
				}
			)
			.addClone(
				"Block.02",
				block,
				{
					position: new THREE.Vector3(12, 0, -12),
				}
			)
			.addClone(
				"Block.03",
				block,
				{
					position: new THREE.Vector3(-12, 0, 12),
				}
			)
			.addClone(
				"Block.04",
				block,
				{
					position: new THREE.Vector3(12, 0, 12),
				}
			)
			.build();
	}
}
