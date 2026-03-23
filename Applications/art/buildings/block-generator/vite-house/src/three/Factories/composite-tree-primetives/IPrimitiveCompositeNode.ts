import type { IPrimitiveNode } from "./IPrimitiveNode";


export interface IPrimitiveCompositeNode extends IPrimitiveNode {
	add(child: IPrimitiveNode): this;
}
