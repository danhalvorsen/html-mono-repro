import { Err, Ok, type Result } from "@monorepo/core-design-patterns";
import type {
  IBehavior,
  IContextPipeline,
} from "@monorepo/core-design-patterns-mediator";

import { OnDragMessage } from "../Messages/OnDragMessage.js";
import { DragPipelineResult } from "../Results/DragPipelineResult.js";

export class RectangleConstraintsBehaviour
  implements IBehavior<OnDragMessage, DragPipelineResult, DragPipelineResult>
{
  public async execute(
    _ctx: IContextPipeline,
    msg: OnDragMessage,
  ): Promise<Result<DragPipelineResult, DragPipelineResult>> {
    const { targetId, target, x, y } = msg.payload;
    const bounds = target.shape.getBoundaries();

    if (
      x < bounds.x ||
      x > bounds.x + bounds.width ||
      y < bounds.y ||
      y > bounds.y + bounds.height
    ) {
      return Err(
        DragPipelineResult.fail(
          this.constructor.name,
          `Target '${targetId}' is outside drag bounds.`,
        ),
      );
    }

    return Ok(DragPipelineResult.ok(this.constructor.name));
  }
}