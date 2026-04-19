import { IBox3 } from "./IBox3.js";


export interface IBox3Collision {
  intersects(left: IBox3, right: IBox3): boolean;
}
