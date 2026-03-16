// // Applications/audio/WebAudio/application-web-audio/tests/fixtures/DragControllerFixture.ts

// import { Point } from "@monorepo/core-math";
// import { DragController, type IDraggable, type Shape} from "../../src/index.js";
// import { TestReactiveHost } from "./TestReactiveHost.js";

// class TestDraggable extends HTMLElement implements IDraggable {
//   public readonly shape = {} as Shape;
//   public position: Point;
//   public hit = false;

//   public readonly setPositionCalls: Point[] = [];
//   public readonly containsPointCalls: Point[] = [];

//   public constructor(position: Point = { x: 0, y: 0 }) {
//     super();
//     this.position = position;
//   }

//   public getPosition(): Point {
//     return this.position;
//   }

//   public setPosition(position: Point): void {
//     this.position = position;
//     this.setPositionCalls.push(position);
//   }

//   public containsPoint(point: Point): boolean {
//     this.containsPointCalls.push(point);
//     return this.hit;
//   }
// }

// if (!customElements.get("test-draggable")) {
//   customElements.define("test-draggable", TestDraggable);
// }

// export class FakeMouseController {
//   public constructor(
//     private readonly controller: DragController,
//   ) {}

//   public down(point: Point): this {
//     this.controller.onPointerDown(point);
//     return this;
//   }

//   public move(point: Point): this {
//     this.controller.onPointerMove(point);
//     return this;
//   }

//   public up(): this {
//     this.controller.onPointerUp();
//     return this;
//   }

//   public leave(): this {
//     this.controller.onPointerLeave();
//     return this;
//   }

//   public drag(from: Point, to: Point, steps: number = 1): this {
//     const normalizedSteps = Math.max(1, Math.floor(steps));

//     this.down(from);

//     for (let index = 1; index <= normalizedSteps; index++) {
//       const t = index / normalizedSteps;

//       this.move({
//         x: from.x + (to.x - from.x) * t,
//         y: from.y + (to.y - from.y) * t,
//       });
//     }

//     this.up();
//     return this;
//   }
// }

// export class DragControllerFixture {
//   public readonly host: TestReactiveHost;
//   public readonly controller: DragController;
//   public readonly mouse: FakeMouseController;

//   private readonly candidates: Element[] = [];

//   public constructor() {
//     this.host = new TestReactiveHost();
//     this.controller = new DragController(this.host, () => this.candidates);
//     this.mouse = new FakeMouseController(this.controller);
//   }

//   public setCandidates(candidates: readonly Element[]): void {
//     this.candidates.splice(0, this.candidates.length, ...candidates);
//   }

//   public addCandidate(candidate: Element): void {
//     this.candidates.push(candidate);
//   }

//   public clearCandidates(): void {
//     this.candidates.splice(0, this.candidates.length);
//   }

//   public createDraggable(
//     options?: Partial<{ x: number; y: number; hit: boolean }>,
//   ): TestDraggable {
//     const draggable = document.createElement("test-draggable") as TestDraggable;
//     draggable.position = {
//       x: options?.x ?? 0,
//       y: options?.y ?? 0,
//     };
//     draggable.hit = options?.hit ?? false;
//     return draggable;
//   }

//   public createPoint(x: number, y: number): Point {
//     return { x, y };
//   }
// }