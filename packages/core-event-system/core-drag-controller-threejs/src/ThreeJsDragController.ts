import * as THREE from "three";
import { IDragEndData, IDragMoveData, IDragStartData } from '../../core-drag-controller-abstract/src/types/drag/drag-contracts';

export interface ThreeDragStartData extends IDragStartData {
  readonly worldStart: THREE.Vector3;
  readonly object: THREE.Object3D;
}

export interface ThreeDragMoveData extends IDragMoveData {
  readonly worldCurrent: THREE.Vector3;
  readonly worldDelta: THREE.Vector3;
  readonly object: THREE.Object3D;
}

export interface ThreeDragEndData extends IDragEndData {
  readonly worldEnd: THREE.Vector3;
  readonly object: THREE.Object3D;
}

