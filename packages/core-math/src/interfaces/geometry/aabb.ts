// import { Vector2 } from "three/src/math/Vector2.js";
// import { IBoundingBox } from "../IBoundingBox.js";

// export  class AABB2 implements IBoundingBox {
//   readonly min: Vector2;
//   readonly max: Vector2;

//   constructor(min: Vector2, max: Vector2) {
//     this.min = min;
//     this.max = max;
//   }

//   width(): number {
//     return this.max.x - this.min.x;
//   }

//   height(): number {
//     return this.max.y - this.min.y;
//   }

//   center(): Vector2 {
//     return new Vector2((this.min.x + this.max.x) * 0.5, (this.min.y + this.max.y) * 0.5);
//   }

//   contains(p: Vector2): boolean {
//     return (
//       p.x >= this.min.x && p.x <= this.max.x &&
//       p.y >= this.min.y && p.y <= this.max.y
//     );
//   }

//   intersects(other: IBoundingBox): boolean {
//     return !(
//       this.max.x < other.min.x ||
//       this.min.x > other.max.x ||
//       this.max.y < other.min.y ||
//       this.min.y > other.max.y
//     );
//   }
// }
