// // ====================================================================================
// // FILE: src/lit3/Controllers/RectangleBoundingboxController.ts
// // ====================================================================================

// import { BoundingBox2D, Vector2 } from "@monorepo/core-math";
// import type { ReactiveController } from "lit";

// import type { IShape } from "../WebComponents/Shapes/Shape/IShape.js";

// type IRectangleShape = IShape & {
//   addController(controller: ReactiveController): void;
//   requestUpdate(): void;
// };

// export class RectangleBoundingBoxController implements ReactiveController {
//   public constructor(private readonly shape: IRectangleShape) {
//     this.shape.addController(this);
//   }

//   public hostConnected(): void {}

//   public hostDisconnected(): void {}

//   public containsPoint(point: Vector2): boolean {
//     return this.getBoundingBox().contains(point);
//   }

//   public getBoundingBox(): BoundingBox2D {
//     const position = this.shape.getPosition();

//     return new BoundingBox2D(
//       position,
//       new Vector2(
//         position.x + this.shape.getWidth(),
//         position.y + this.shape.getHeight(),
//       ),
//     );
//   }

//   public setBoundingBox(bounds: BoundingBox2D): void {
//     this.shape.setPosistion(bounds.min);
//     this.shape.setSize(bounds.width(), bounds.height());
//     this.shape.requestUpdate();
//   }

//   public getCenter(): Vector2 {
//     return this.getBoundingBox().center();
//   }

//   public getWidth(): number {
//     return this.shape.getWidth();
//   }

//   public getHeight(): number {
//     return this.shape.getHeight();
//   }

//   public setCenter(center: Vector2): void {
//     this.shape.setCenter(center);
//     this.shape.requestUpdate();
//   }

//   public setSize(width: number, height: number): void {
//     this.shape.setSize(width, height);
//     this.shape.requestUpdate();
//   }
// }