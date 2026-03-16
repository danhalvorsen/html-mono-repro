import { IBehavior, IContextPipeline } from "@monorepo/core-design-patterns-mediator";
import { IDragStateStore } from "../../Dragging/IDragStateStore";
import { OnDragMessage } from "../Messages/OnDragMessage";
import { DragPipelineResult } from "../Results/DragPipelineResult";
import { Err, Ok, Result } from "@monorepo/core-design-patterns";

// ============================================================================
// src/Pipeline/Behaviors/RectangleConstraintsBehaviour.ts
// ============================================================================

export class RectangleConstraintsBehaviour
    implements IBehavior<OnDragMessage, DragPipelineResult, DragPipelineResult> {
    private static readonly behaviorName = "RectangleConstraintsBehaviour";

    public constructor(
        private readonly stateStore: IDragStateStore
    ) { }

    public async execute(
        _ctx: IContextPipeline,
        msg: OnDragMessage
    ): Promise<Result<DragPipelineResult, DragPipelineResult>> {

        const { targetId, x, y } = msg.payload;

        const bounds = this.stateStore.tryGetBounds(targetId);

        if (bounds === null) {
            return Ok(
                DragPipelineResult.ok(RectangleConstraintsBehaviour.behaviorName)
            );
        }

        if (x < bounds.minX ||
            x > bounds.maxX ||
            y < bounds.minY ||
            y > bounds.maxY) {
            return Err(
                DragPipelineResult.fail(
                    RectangleConstraintsBehaviour.behaviorName,
                    `Target '${targetId}' is outside drag bounds.`
                )
            );
        }

        return Ok(
            DragPipelineResult.ok(RectangleConstraintsBehaviour.behaviorName)
        );
    }
}
