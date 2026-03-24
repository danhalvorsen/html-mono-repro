import * as THREE from "three";


export interface ITransform {
	readonly position?: THREE.Vector3;
	readonly rotation?: THREE.Euler;
	readonly scale?: THREE.Vector3;
}
