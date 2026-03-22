import { Err, Ok, type Result } from "@monorepo/core-design-patterns";
import type {
  IBehavior,
  IContextPipeline,
} from "@monorepo/core-design-patterns-mediator";

import { OnDragMessage } from "../Messages/OnDragMessage.js";
import { DragPipelineResult } from "../Results/DragPipelineResult.js";

export class VisibleBehavior
  implements IBehavior<OnDragMessage, DragPipelineResult, DragPipelineResult>
{
  public async execute(
    _ctx: IContextPipeline,
    msg: OnDragMessage,
  ): Promise<Result<DragPipelineResult, DragPipelineResult>> {
    const { targetId, target } = msg.payload;
    const visible = "visible" in target ? target.visible : true;

    if (visible !== true) {
      return Err(
        DragPipelineResult.fail(
          this.constructor.name,
          `Target '${targetId}' is not visible.`,
        ),
      );
    }

    return Ok(
      DragPipelineResult.ok(this.constructor.name),
    );
  }
}