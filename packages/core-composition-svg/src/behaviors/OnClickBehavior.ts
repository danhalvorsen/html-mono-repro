import type { HitResult } from "../HitTester.js";
import type { CompositeNode } from "../CompositeNode.js";
import { BehaviorNode } from "./BehaviorNode.js";
import { BehaviorHandler } from "./BehaviorHandler.js";

export type ClickHandlerPayload = HitResult & { event: PointerEvent };
export type ClickHandler = (payload: ClickHandlerPayload) => void;

export class OnClickBehavior extends BehaviorNode {
  private readonly handler: BehaviorHandler<ClickHandlerPayload>;

  constructor(id: string, child: CompositeNode, handler: ClickHandler) {
    super(id, child);
    this.handler = new BehaviorHandler(handler);
  }

  onHit(node: CompositeNode, event: PointerEvent, localPoint: DOMPoint) {
    this.handler.handle({ node, localPoint, event });
  }
}
