import type { IPrimitiveNodeFactory } from "./IPrimitiveNodeFactory";
import type { IPrimitiveCompositeNode } from "./IPrimitiveCompositeNode";
import type { IPrimitiveNode } from "./IPrimitiveNode";
import type { ITransform } from "./ITransform";

// =====================================================================================
// SHARED COMPOSITE BUILDER
// =====================================================================================
export class CompositeBuilder {
	private readonly group: IPrimitiveCompositeNode;

	public constructor(
		private readonly factory: IPrimitiveNodeFactory,
		private readonly name: string
	) {
		this.group = this.factory.createGroup(name);
	}

	public addNode(
		localName: string,
		node: IPrimitiveNode,
		transform?: ITransform
	): this {
		this.group.add(
			this.factory.createTransform(
				`${this.name}.${localName}.Instance`,
				node,
				transform
			)
		);

		return this;
	}

	public addClone(
		localName: string,
		template: IPrimitiveNode,
		transform?: ITransform
	): this {
		return this.addNode(localName, template.cloneNode(), transform);
	}

	public addBox(
		localName: string,
		width: number,
		height: number,
		depth: number,
		transform?: ITransform
	): this {
		return this.addNode(
			localName,
			this.factory.box(`${this.name}.${localName}`, width, height, depth),
			transform
		);
	}

	public addCylinder(
		localName: string,
		radius: number,
		height: number,
		segments: number = 16,
		transform?: ITransform
	): this {
		return this.addNode(
			localName,
			this.factory.cylinder(`${this.name}.${localName}`, radius, height, segments),
			transform
		);
	}

	public addHalfSphere(
		localName: string,
		radius: number,
		segments: number = 16,
		transform?: ITransform
	): this {
		return this.addNode(
			localName,
			this.factory.halfSphere(`${this.name}.${localName}`, radius, segments),
			transform
		);
	}

	public build(): IPrimitiveNode {
		return this.group;
	}
}
