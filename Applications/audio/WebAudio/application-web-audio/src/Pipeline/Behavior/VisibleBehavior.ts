import { IBehavior, IContextPipeline } from "@monorepo/core-design-patterns-mediator";
import { IDragStateStore } from "../../Dragging/IDragStateStore";
import { OnDragMessage } from "../Messages/OnDragMessage";
import { DragPipelineResult } from "../Results/DragPipelineResult";
import { Err, Ok, Result } from "@monorepo/core-design-patterns";   

// ============================================================================
// src/Pipeline/Behaviors/VisibleBehavior.ts
// ============================================================================

export class VisibleBehavior
    implements IBehavior<OnDragMessage, DragPipelineResult, DragPipelineResult> {
    private static readonly behaviorName = "VisibleBehavior";

    public constructor(
        private readonly stateStore: IDragStateStore
    ) { }

    public async execute(
        _ctx: IContextPipeline,
        msg: OnDragMessage
    ): Promise<Result<DragPipelineResult, DragPipelineResult>> {

        const { targetId } = msg.payload;

        if (!this.stateStore.isVisible(targetId)) {
            return Err(
                DragPipelineResult.fail(
                    VisibleBehavior.behaviorName,
                    `Target '${targetId}' is not visible.`
                )
            );
        }

        return Ok(
            DragPipelineResult.ok(VisibleBehavior.behaviorName)
        );
    }
}
