import { Err, Ok, type Result } from "@monorepo/core-design-patterns";
import type {
	IBehavior,
	IContextPipeline,
} from "@monorepo/core-design-patterns-mediator";

import { OnDragMessage } from "../Messages/OnDragMessage.js";
import { DragPipelineResult } from "../Results/DragPipelineResult.js";

export class DraggingEnabledBehavior
	implements IBehavior<OnDragMessage, DragPipelineResult, DragPipelineResult>
{
	public async execute(
		_ctx: IContextPipeline,
		msg: OnDragMessage,
	): Promise<Result<DragPipelineResult, DragPipelineResult>> {
		if (!msg.payload.targetId) {
			return Err(
				DragPipelineResult.fail(
					this.constructor.name,
					`Dragging disabled for '${msg.payload.operation}'.`,
				),
			);
		}

		return Ok(DragPipelineResult.ok(this.constructor.name));
	}
}
