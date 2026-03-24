import * as THREE from "three";
import type { IPrimitiveCompositeNode } from "./IPrimitiveCompositeNode";
import type { IPrimitiveNode } from "./IPrimitiveNode";


export class PrimitiveCompositeNode implements IPrimitiveCompositeNode {
	private readonly children: IPrimitiveNode[] = [];

	public constructor(
		public readonly name: string,
		children?: readonly IPrimitiveNode[]
	) {
		if (children !== undefined) {
			this.children.push(...children);
		}
	}

	public operation(): void {
		for (const child of this.children) {
			child.operation();
		}
	}

	public add(child: IPrimitiveNode): this {
		this.children.push(child);
		return this;
	}

	public instantiate(): THREE.Object3D {
		const group = new THREE.Group();
		group.name = this.name;

		for (const child of this.children) {
			group.add(child.instantiate());
		}

		return group;
	}

	public cloneNode(): IPrimitiveNode {
		return new PrimitiveCompositeNode(
			this.name,
			this.children.map((child) => child.cloneNode())
		);
	}

	public getChildren(): readonly IPrimitiveNode[] {
		return this.children;
	}
}
