import * as THREE from "three";

import type { IThreeScene } from "../IThreeScene.js";
import { PlaygroundSceneBase } from "../common/PlaygroundSceneBase.js";

import type { IMaterialFactory } from "../../../Materials/IMaterialFactory.js";
import { MaterialToken } from "../../../Materials/MaterialToken.js";

import { PrimitiveFactoryComposition } from "../../../Factories/PrimitiveFactoryComposition.js";
import { PrimitiveType } from "../../../Factories/PrimitiveType.js";

import {
	PrimitiveComposite,
	PrimitiveNodeFactory,
	PrimitiveTreeSearch,
	type IPrimitiveNode,
} from "../../../Factories/composite-tree-primetives/code.js";

export class PrimitiveCompositionTreePlaygroundScene extends PlaygroundSceneBase {
	private _primitiveNodeFactory?: PrimitiveNodeFactory;

	public constructor(
		scene: IThreeScene,
		materialFactory: IMaterialFactory,
	) {
		super(scene, "primitive-composition-tree-playground-root", materialFactory);
	}

	private get primitiveNodeFactory(): PrimitiveNodeFactory {
		if (this._primitiveNodeFactory === undefined) {
			this._primitiveNodeFactory = new PrimitiveNodeFactory(
				PrimitiveFactoryComposition.create(),
			);
		}

		return this._primitiveNodeFactory;
	}

	protected createContent(): void {
		const library = this.createLibrary();

		const districtTemplate = PrimitiveTreeSearch.findByName(
			library,
			"Template.District",
		);

		if (districtTemplate === null) {
			throw new Error("Template.District not found.");
		}

		const sceneComposition = this.primitiveNodeFactory.createGroup("Scene.Composition");
		sceneComposition.add(districtTemplate.cloneNode());

		const object3d = sceneComposition.instantiate();
		object3d.position.set(0, 0, 0);

		this.applyMaterialAndShadowPolicy(object3d);
		this.addHelpers();
		this.addToRoot(object3d);
	}

	private createLibrary(): PrimitiveComposite {
		const library = this.primitiveNodeFactory.createGroup("Library");
		const templates = this.primitiveNodeFactory.createGroup("Templates");

		const house = this.createHouseTemplate();
		const tower = this.createTowerTemplate();
		const plaza = this.createPlazaTemplate();
		const block = this.createBlockTemplate(house, tower, plaza);
		const district = this.createDistrictTemplate(block);

		templates.add(house);
		templates.add(tower);
		templates.add(plaza);
		templates.add(block);
		templates.add(district);

		library.add(templates);

		return library;
	}

	private createHouseTemplate(): PrimitiveComposite {
		const house = this.primitiveNodeFactory.createGroup("Template.House");

		// -------------------------------------------------------------------------
		// MAIN HOUSE
		// -------------------------------------------------------------------------

		const mainBody = this.primitiveNodeFactory.createPrimitive("House.MainBody", {
			type: PrimitiveType.Box,
			width: 5.5,
			height: 2.8,
			depth: 4.5,
		});

		const leftRoof = this.primitiveNodeFactory.createPrimitive("House.Roof.Left", {
			type: PrimitiveType.Box,
			width: 2.95,
			height: 0.18,
			depth: 4.8,
		});

		const rightRoof = this.primitiveNodeFactory.createPrimitive("House.Roof.Right", {
			type: PrimitiveType.Box,
			width: 2.95,
			height: 0.18,
			depth: 4.8,
		});

		const roofRidgeCap = this.primitiveNodeFactory.createPrimitive("House.Roof.RidgeCap", {
			type: PrimitiveType.Box,
			width: 0.18,
			height: 0.18,
			depth: 4.9,
		});

		// -------------------------------------------------------------------------
		// GARAGE
		// -------------------------------------------------------------------------

		const garageBody = this.primitiveNodeFactory.createPrimitive("House.Garage.Body", {
			type: PrimitiveType.Box,
			width: 3.2,
			height: 2.2,
			depth: 3.8,
		});

		const garageRoof = this.primitiveNodeFactory.createPrimitive("House.Garage.Roof", {
			type: PrimitiveType.Box,
			width: 3.45,
			height: 0.16,
			depth: 4.05,
		});

		// -------------------------------------------------------------------------
		// PORCH
		// -------------------------------------------------------------------------

		const porchRoof = this.primitiveNodeFactory.createPrimitive("House.Porch.Roof", {
			type: PrimitiveType.Box,
			width: 1.8,
			height: 0.12,
			depth: 1.4,
		});

		const porchColumnLeft = this.primitiveNodeFactory.createPrimitive("House.Porch.Column.Left", {
			type: PrimitiveType.Cylinder,
			radius: 0.08,
			height: 1.0,
			segments: 16,
		});

		const porchColumnRight = this.primitiveNodeFactory.createPrimitive("House.Porch.Column.Right", {
			type: PrimitiveType.Cylinder,
			radius: 0.08,
			height: 1.0,
			segments: 16,
		});

		// -------------------------------------------------------------------------
		// CHIMNEY / PIPE
		// -------------------------------------------------------------------------

		const chimney = this.primitiveNodeFactory.createPrimitive("House.Chimney", {
			type: PrimitiveType.Box,
			width: 0.45,
			height: 1.3,
			depth: 0.45,
		});

		const pipe = this.primitiveNodeFactory.createPrimitive("House.Pipe", {
			type: PrimitiveType.Cylinder,
			radius: 0.07,
			height: 0.7,
			segments: 16,
		});

		// -------------------------------------------------------------------------
		// STEPS
		// -------------------------------------------------------------------------

		const stepA = this.primitiveNodeFactory.createPrimitive("House.Step.A", {
			type: PrimitiveType.Box,
			width: 1.2,
			height: 0.12,
			depth: 0.5,
		});

		const stepB = this.primitiveNodeFactory.createPrimitive("House.Step.B", {
			type: PrimitiveType.Box,
			width: 1.0,
			height: 0.12,
			depth: 0.4,
		});

		// -------------------------------------------------------------------------
		// COMPOSE
		// -------------------------------------------------------------------------

		house.add(new TransformedPrimitiveNode(
			"House.MainBody.Instance",
			mainBody,
			new THREE.Vector3(0, 1.4, 0),
		));

		house.add(new TransformedPrimitiveNode(
			"House.Roof.Left.Instance",
			leftRoof,
			new THREE.Vector3(-1.38, 3.25, 0),
			new THREE.Euler(0, 0, THREE.MathUtils.degToRad(32)),
		));

		house.add(new TransformedPrimitiveNode(
			"House.Roof.Right.Instance",
			rightRoof,
			new THREE.Vector3(1.38, 3.25, 0),
			new THREE.Euler(0, 0, THREE.MathUtils.degToRad(-32)),
		));

		house.add(new TransformedPrimitiveNode(
			"House.Roof.RidgeCap.Instance",
			roofRidgeCap,
			new THREE.Vector3(0, 3.82, 0),
		));

		house.add(new TransformedPrimitiveNode(
			"House.Garage.Body.Instance",
			garageBody,
			new THREE.Vector3(4.2, 1.1, -0.1),
		));

		house.add(new TransformedPrimitiveNode(
			"House.Garage.Roof.Instance",
			garageRoof,
			new THREE.Vector3(4.2, 2.28, -0.1),
			new THREE.Euler(0, 0, THREE.MathUtils.degToRad(-6)),
		));

		house.add(new TransformedPrimitiveNode(
			"House.Porch.Roof.Instance",
			porchRoof,
			new THREE.Vector3(-1.25, 1.75, 2.75),
		));

		house.add(new TransformedPrimitiveNode(
			"House.Porch.Column.Left.Instance",
			porchColumnLeft,
			new THREE.Vector3(-1.85, 0.5, 2.95),
		));

		house.add(new TransformedPrimitiveNode(
			"House.Porch.Column.Right.Instance",
			porchColumnRight,
			new THREE.Vector3(-0.65, 0.5, 2.95),
		));

		house.add(new TransformedPrimitiveNode(
			"House.Chimney.Instance",
			chimney,
			new THREE.Vector3(1.15, 4.0, -0.9),
		));

		house.add(new TransformedPrimitiveNode(
			"House.Pipe.Instance",
			pipe,
			new THREE.Vector3(1.15, 4.95, -0.9),
		));

		house.add(new TransformedPrimitiveNode(
			"House.Step.A.Instance",
			stepA,
			new THREE.Vector3(-1.25, 0.06, 2.95),
		));

		house.add(new TransformedPrimitiveNode(
			"House.Step.B.Instance",
			stepB,
			new THREE.Vector3(-1.25, 0.18, 3.38),
		));

		return house;
	}

	private createTowerTemplate(): PrimitiveComposite {
		const tower = this.primitiveNodeFactory.createGroup("Template.Tower");

		const core = this.primitiveNodeFactory.createPrimitive("Tower.Core", {
			type: PrimitiveType.Cylinder,
			radius: 0.75,
			height: 5.0,
			segments: 20,
		});

		const dome = this.primitiveNodeFactory.createPrimitive("Tower.Dome", {
			type: PrimitiveType.HalfSphere,
			radius: 0.9,
			segments: 20,
		});

		tower.add(new TransformedPrimitiveNode(
			"Tower.Core.Instance",
			core,
			new THREE.Vector3(0, 2.5, 0),
		));

		tower.add(new TransformedPrimitiveNode(
			"Tower.Dome.Instance",
			dome,
			new THREE.Vector3(0, 5.0, 0),
		));

		return tower;
	}

	private createPlazaTemplate(): PrimitiveComposite {
		const plaza = this.primitiveNodeFactory.createGroup("Template.Plaza");

		const center = this.primitiveNodeFactory.createPrimitive("Plaza.Center", {
			type: PrimitiveType.Box,
			width: 2.0,
			height: 0.2,
			depth: 2.0,
		});

		const monument = this.primitiveNodeFactory.createPrimitive("Plaza.Monument", {
			type: PrimitiveType.Cylinder,
			radius: 0.25,
			height: 1.6,
			segments: 16,
		});

		plaza.add(new TransformedPrimitiveNode(
			"Plaza.Center.Instance",
			center,
			new THREE.Vector3(0, 0.1, 0),
		));

		plaza.add(new TransformedPrimitiveNode(
			"Plaza.Monument.Instance",
			monument,
			new THREE.Vector3(0, 0.8, 0),
		));

		return plaza;
	}

	private createBlockTemplate(
		houseTemplate: PrimitiveComposite,
		towerTemplate: PrimitiveComposite,
		plazaTemplate: PrimitiveComposite,
	): PrimitiveComposite {
		const block = this.primitiveNodeFactory.createGroup("Template.Block");

		block.add(new TransformedPrimitiveNode(
			"Block.House.A",
			houseTemplate.cloneNode(),
			new THREE.Vector3(-5, 0, -4),
		));

		block.add(new TransformedPrimitiveNode(
			"Block.House.B",
			houseTemplate.cloneNode(),
			new THREE.Vector3(0, 0, -4),
		));

		block.add(new TransformedPrimitiveNode(
			"Block.House.C",
			houseTemplate.cloneNode(),
			new THREE.Vector3(5, 0, -4),
		));

		block.add(new TransformedPrimitiveNode(
			"Block.Tower",
			towerTemplate.cloneNode(),
			new THREE.Vector3(0, 0, 4),
		));

		block.add(new TransformedPrimitiveNode(
			"Block.Plaza",
			plazaTemplate.cloneNode(),
			new THREE.Vector3(0, 0, 0),
		));

		return block;
	}

	private createDistrictTemplate(
		blockTemplate: PrimitiveComposite,
	): PrimitiveComposite {
		const district = this.primitiveNodeFactory.createGroup("Template.District");

		district.add(new TransformedPrimitiveNode(
			"District.Block.01",
			blockTemplate.cloneNode(),
			new THREE.Vector3(-12, 0, -12),
		));

		district.add(new TransformedPrimitiveNode(
			"District.Block.02",
			blockTemplate.cloneNode(),
			new THREE.Vector3(12, 0, -12),
		));

		district.add(new TransformedPrimitiveNode(
			"District.Block.03",
			blockTemplate.cloneNode(),
			new THREE.Vector3(-12, 0, 12),
		));

		district.add(new TransformedPrimitiveNode(
			"District.Block.04",
			blockTemplate.cloneNode(),
			new THREE.Vector3(12, 0, 12),
		));

		return district;
	}

	private applyMaterialAndShadowPolicy(root: THREE.Object3D): void {
		root.traverse((node) => {
			if (!(node instanceof THREE.Mesh)) {
				return;
			}

			node.material = this.materialFactory.create(MaterialToken.BuildingBlue);
			node.castShadow = true;
			node.receiveShadow = true;
		});
	}

	private addHelpers(): void {
		this.addToRoot(new THREE.AxesHelper(8));
		this.addToRoot(new THREE.GridHelper(80, 80));
	}
}

class TransformedPrimitiveNode implements IPrimitiveNode {
	public constructor(
		public readonly name: string,
		private readonly inner: IPrimitiveNode,
		private readonly position: THREE.Vector3,
		private readonly rotation: THREE.Euler = new THREE.Euler(0, 0, 0),
		private readonly scale: THREE.Vector3 = new THREE.Vector3(1, 1, 1),
	) {}

	public operation(): void {
		this.inner.operation();
	}

	public getChildren(): readonly IPrimitiveNode[] {
		return this.inner.getChildren();
	}

	public instantiate(): THREE.Object3D {
		const instance = this.inner.instantiate();
		instance.name = this.name;
		instance.position.copy(this.position);
		instance.rotation.copy(this.rotation);
		instance.scale.copy(this.scale);
		return instance;
	}

	public cloneNode(): IPrimitiveNode {
		return new TransformedPrimitiveNode(
			this.name,
			this.inner.cloneNode(),
			this.position.clone(),
			this.rotation.clone(),
			this.scale.clone(),
		);
	}
}