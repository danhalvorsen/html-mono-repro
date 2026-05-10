import { PolygonCollisionSystem } from "./PolygonCollisionSystem.js";

export class PolygonCollisionSystemRoot {
  public static createDefault(): PolygonCollisionSystem {
    return new PolygonCollisionSystem();
  }
}
