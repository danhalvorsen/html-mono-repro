import { PrimitiveLeafNode } from "./PrimitiveLeafNode";
import { IPrimitiveNodeFactory } from "./IPrimitiveNodeFactory";
import { PrimitiveRequest } from "./PrimitiveRequest";
import { IPrimitiveFactory } from "./IPrimitiveFactory";
import { PrimitiveType } from "./PrimitiveType";
import { IPrimitiveCompositeNode } from "./IPrimitiveCompositeNode";
import { IPrimitiveNode } from "./IPrimitiveNode";
import { ITransform } from "./ITransform";
import { PrimitiveCompositeNode } from "./PrimitiveCompositeNode";
import { TransformNode } from "./TransformNode";

// =====================================================================================
// NODE FACTORY
// =====================================================================================
export class PrimitiveNodeFactory implements IPrimitiveNodeFactory {
	public constructor(
		private readonly primitiveFactory: IPrimitiveFactory
	) { }

	public createPrimitive(name: string, request: PrimitiveRequest): IPrimitiveNode {
		return new PrimitiveLeafNode(name, request, this.primitiveFactory);
	}

	public createGroup(
		name: string,
		children?: readonly IPrimitiveNode[]
	): IPrimitiveCompositeNode {
		return new PrimitiveCompositeNode(name, children);
	}

	public createTransform(
		name: string,
		inner: IPrimitiveNode,
		transform?: ITransform
	): IPrimitiveNode {
		return new TransformNode(name, inner, transform);
	}

	public box(name: string, width: number, height: number, depth: number): IPrimitiveNode {
		return this.createPrimitive(name, {
			type: PrimitiveType.Box,
			width,
			height,
			depth,
		});
	}

	public cylinder(
		name: string,
		radius: number,
		height: number,
		segments: number = 16
	): IPrimitiveNode {
		return this.createPrimitive(name, {
			type: PrimitiveType.Cylinder,
			radius,
			height,
			segments,
		});
	}

	public halfSphere(
		name: string,
		radius: number,
		segments: number = 16
	): IPrimitiveNode {
		return this.createPrimitive(name, {
			type: PrimitiveType.HalfSphere,
			radius,
			segments,
		});
	}
}
