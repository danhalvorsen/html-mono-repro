import * as THREE from "three";

// =====================================================
// MATERIAL (shared)
// =====================================================
export const defaultMaterial = () => new THREE.MeshStandardMaterial({
    color: 0x808080,
    roughness: 0.7,
    metalness: 0.1,
});
