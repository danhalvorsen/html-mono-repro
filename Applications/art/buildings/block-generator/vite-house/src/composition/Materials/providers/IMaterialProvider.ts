import * as THREE from "three";
import type { MaterialToken } from "../MaterialToken";


export interface IMaterialProvider {
    supports(token: MaterialToken): boolean;
    create(): THREE.Material;
}
