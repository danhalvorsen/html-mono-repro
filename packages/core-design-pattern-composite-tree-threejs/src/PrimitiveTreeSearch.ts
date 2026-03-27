import type { IPrimitiveNode } from "./IPrimitiveNode.js";

// =====================================================================================
// SEARCH
// =====================================================================================
export class PrimitiveTreeSearch {
	public static findByName(
		root: IPrimitiveNode,
		name: string
	): IPrimitiveNode | null {
		if (root.name === name) {
			return root;
		}

		for (const child of root.getChildren()) {
			const found = PrimitiveTreeSearch.findByName(child, name);

			if (found !== null) {
				return found;
			}
		}

		return null;
	}
}
