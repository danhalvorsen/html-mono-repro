import * as THREE from "three";

export type State = Readonly<{
    point0: THREE.Vector2 | null;
    point1: THREE.Vector2 | null;
    loftHeight: number | null;
}>;
