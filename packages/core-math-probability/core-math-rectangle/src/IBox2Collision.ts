import { IBox2 } from "./IBox2.js";


export interface IBox2Collision {
  intersects(left: IBox2, right: IBox2): boolean;
}
