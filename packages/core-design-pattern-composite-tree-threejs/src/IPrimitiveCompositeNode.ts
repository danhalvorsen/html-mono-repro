import type { IPrimitiveNode } from "./IPrimitiveNode.js";


export interface IPrimitiveCompositeNode extends IPrimitiveNode {
	add(child: IPrimitiveNode): this;
}
