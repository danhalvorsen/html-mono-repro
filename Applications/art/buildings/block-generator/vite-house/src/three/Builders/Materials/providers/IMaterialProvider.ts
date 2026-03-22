import * as THREE from "three";

export interface IMaterialProvider {
    supports(token: string): boolean;
    create(): THREE.Material;
}
