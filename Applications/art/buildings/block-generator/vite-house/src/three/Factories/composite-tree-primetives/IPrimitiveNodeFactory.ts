import type { IPrimitiveCompositeNode } from "./IPrimitiveCompositeNode";
import type { IPrimitiveNode } from "./IPrimitiveNode";
import type { ITransform } from "./ITransform";
import type { PrimitiveRequest } from "./PrimitiveRequest";


export interface IPrimitiveNodeFactory {
	createPrimitive(name: string, request: PrimitiveRequest): IPrimitiveNode;
	createGroup(name: string, children?: readonly IPrimitiveNode[]): IPrimitiveCompositeNode;
	createTransform(name: string, inner: IPrimitiveNode, transform?: ITransform): IPrimitiveNode;

	box(name: string, width: number, height: number, depth: number): IPrimitiveNode;
	cylinder(name: string, radius: number, height: number, segments?: number): IPrimitiveNode;
	halfSphere(name: string, radius: number, segments?: number): IPrimitiveNode;
}
