import * as THREE from "three";

import {
  BaseDragController,
  CommonEvent,
  Drag,
  IDragEndData,
  IDragMoveData,
  IDragStartData,
  ICommonEvent,
  Mouse,
  Position,
  TimeStamp
} from "@monorepo/core-drag-controller-abstract";

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

export class ThreeJsDragController extends BaseDragController {
  private readonly camera: THREE.Camera;
  private readonly scene: THREE.Scene;
  private readonly raycaster = new THREE.Raycaster();
  private readonly mouse: Mouse.IMouseController;

  private readonly dragState: {
    active: boolean;
    object: THREE.Object3D | null;
    pointer: {
      start: Position | null;
      last: Position | null;
    };
    world: {
      start: THREE.Vector3 | null;
      last: THREE.Vector3 | null;
    };
  } = {
      active: false,
      object: null,
      pointer: { start: null, last: null },
      world: { start: null, last: null }
    };

constructor(
  mouse: Mouse.IMouseController,
  scene: THREE.Scene,
  camera: THREE.Camera
){
    super();
    this.mouse = mouse;
    this.scene = scene;
    this.camera = camera;

    this.mouse.onDown((pos: Position): void => this.tryBeginDrag(pos));
    this.mouse.onMove((pos: Position): void => this.tryMoveDrag(pos));
    this.mouse.onUp((pos: Position): void => this.tryEndDrag(pos));
  }

  private raycast(pos: Position): THREE.Intersection[] {
    const pointer = new THREE.Vector2(pos.x, pos.y);
    this.raycaster.setFromCamera(pointer, this.camera);
    return this.raycaster.intersectObjects(this.scene.children, true);
  }

  private tryBeginDrag(pos: Position): void {
    const hits = this.raycast(pos);
    if (hits.length === 0) return;

    const hit = hits[0];

    this.dragState.active = true;
    this.dragState.object = hit.object;

    this.dragState.pointer.start = pos;
    this.dragState.pointer.last = pos;

    this.dragState.world.start = hit.point.clone();
    this.dragState.world.last = hit.point.clone();

    const data: ThreeDragStartData = {
      event: Drag.DRAG_START,
      start: pos,
      worldStart: hit.point.clone(),
      object: hit.object
    };

    const evt: ICommonEvent<ThreeDragStartData> = new CommonEvent(
      Drag.DRAG_START,
      TimeStamp.now(),
      data
    );

    this.emitStart(evt);
  }

  private tryMoveDrag(pos: Position): void {
    if (!this.dragState.active ||
      !this.dragState.object ||
      !this.dragState.world.start ||
      !this.dragState.world.last ||
      !this.dragState.pointer.start ||
      !this.dragState.pointer.last) {
      return;
    }

    const hits = this.raycast(pos);
    if (hits.length === 0) return;

    const hit = hits[0];
    const world = hit.point.clone();
    const worldDelta = new THREE.Vector3().subVectors(world, this.dragState.world.last);

    const data: ThreeDragMoveData = {
      event: Drag.DRAG_MOVE,
      start: this.dragState.pointer.start,
      current: pos,
      delta: {
        x: pos.x - this.dragState.pointer.last.x,
        y: pos.y - this.dragState.pointer.last.y
      },
      worldCurrent: world,
      worldDelta,
      object: this.dragState.object
    };

    const evt: ICommonEvent<ThreeDragMoveData> = new CommonEvent(
      Drag.DRAG_MOVE,
      TimeStamp.now(),
      data
    );

    this.dragState.pointer.last = pos;
    this.dragState.world.last = world;

    this.emitMove(evt);
  }

  private tryEndDrag(pos: Position): void {
    if (!this.dragState.active || !this.dragState.object || !this.dragState.world.start) return;

    const hits = this.raycast(pos);
    const worldEnd = hits.length > 0 ? hits[0].point.clone() : this.dragState.world.last!.clone();

    const data: ThreeDragEndData = {
      event: Drag.DRAG_END,
      start: this.dragState.pointer.start!,
      end: pos,
      worldEnd,
      object: this.dragState.object
    };

    const evt: ICommonEvent<ThreeDragEndData> = new CommonEvent(
      Drag.DRAG_END,
      TimeStamp.now(),
      data
    );

    this.emitEnd(evt);

    this.dragState.active = false;
    this.dragState.object = null;
    this.dragState.pointer.start = null;
    this.dragState.pointer.last = null;
    this.dragState.world.start = null;
    this.dragState.world.last = null;
  }

  dispose(): void {
    this.dragState.active = false;
    this.dragState.object = null;
    this.dragState.pointer.start = null;
    this.dragState.pointer.last = null;
    this.dragState.world.start = null;
    this.dragState.world.last = null;
  }
}
