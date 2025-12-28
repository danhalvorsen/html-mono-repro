import { AnchorSide } from "./AnchorSide";
import { AnchorEdge } from "./AnchorEdge";

/**
 * Identifies a semantic anchor on a node.
 * No geometry, no coordinates.
 */

export class AnchorRef {
  constructor(
    public readonly nodeId: string,
    public readonly edge: AnchorEdge,
    public readonly side: AnchorSide
  ) { }
}
