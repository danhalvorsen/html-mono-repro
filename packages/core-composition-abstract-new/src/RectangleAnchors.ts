import { AnchorRef } from "./AnchorRef";

// ---------- Rectangle Anchor Helper ----------
/**
 * Rectangle exposes semantic anchors.
 * Geometry resolution happens later.
 */

export class RectangleAnchors {
  constructor(private readonly nodeId: string) { }

  get Top() {
    return {
      Left: new AnchorRef(this.nodeId, "top", "left"),
      Midpoint: new AnchorRef(this.nodeId, "top", "center"),
      Right: new AnchorRef(this.nodeId, "top", "right"),
    };
  }

  get Center() {
    return {
      Left: new AnchorRef(this.nodeId, "center", "left"),
      Midpoint: new AnchorRef(this.nodeId, "center", "center"),
      Right: new AnchorRef(this.nodeId, "center", "right"),
    };
  }

  get Bottom() {
    return {
      Left: new AnchorRef(this.nodeId, "bottom", "left"),
      Midpoint: new AnchorRef(this.nodeId, "bottom", "center"),
      Right: new AnchorRef(this.nodeId, "bottom", "right"),
    };
  }
}
