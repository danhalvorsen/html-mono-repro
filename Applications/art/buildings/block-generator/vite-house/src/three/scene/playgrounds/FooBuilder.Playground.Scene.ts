import * as THREE from "three";
import { Foo, FooBuilder } from "../../Builders/FooBuilder.js";
import type { IThreeScene } from "../IThreeScene.js";
import { PlaygroundSceneBase } from "../common/PlaygroundSceneBase.js";
import type { IMaterialFactory } from "../../../../core-threejs-app-framework/src/Materials/IMaterialFactory.js";
import { MaterialToken } from "../../../../core-threejs-app-framework/src/Materials/MaterialToken.js";

export class FooBuilderPlaygroundScene extends PlaygroundSceneBase {
	public constructor(
		scene: IThreeScene,
		materialFactory: IMaterialFactory,
	) {
		super(scene, "foo-builder-playground-root", materialFactory);
	}

	protected createContent(): void {
		const boxCount = this.randomInt(0, 100);
		let currentY = 0;

		for (let i = 0; i < boxCount; i += 1) {
			const width = this.randomFloat(0.5, 2.0);
			const height = this.randomFloat(0.35, 12.5);
			const depth = this.randomFloat(0.5, 23.0);

			const mesh = new FooBuilder().build(
				new Foo(width, height, depth, {
					position: new THREE.Vector3(
						this.randomFloat(-0.25, 0.25),
						currentY + (height / 2),
						this.randomFloat(-0.25, 0.25),
					),
				}),
			) as THREE.Mesh;

			mesh.material = this.materialFactory.create(MaterialToken.BuildingBlue);
			mesh.castShadow = true;
			mesh.receiveShadow = true;

			this.addToRoot(mesh);
			currentY += height;
		}
	}

	private randomInt(min: number, max: number): number {
		return Math.floor(Math.random() * ((max - min) + 1)) + min;
	}

	private randomFloat(min: number, max: number): number {
		return min + (Math.random() * (max - min));
	}
}
