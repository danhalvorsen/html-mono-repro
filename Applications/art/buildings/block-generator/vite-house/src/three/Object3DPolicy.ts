import * as THREE from "three";

// =====================================================================================
// MATERIAL / SHADOW POLICY
// =====================================================================================
export class Object3DPolicy {
	public static applyMaterialAndShadows(
		root: THREE.Object3D,
		material: THREE.Material
	): void {
		root.traverse((node) => {
			if (!(node instanceof THREE.Mesh)) {
				return;
			}

			node.material = material;
			node.castShadow = true;
			node.receiveShadow = true;
		});
	}
}
