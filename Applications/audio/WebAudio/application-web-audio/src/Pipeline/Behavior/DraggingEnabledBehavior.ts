import { IBehavior, IContextPipeline } from "@monorepo/core-design-patterns-mediator";
import { IDragStateStore } from "../../Dragging/IDragStateStore";
import { OnDragMessage } from "../Messages/OnDragMessage";
import { DragPipelineResult } from "../Results/DragPipelineResult";
import { Err, Ok } from "@monorepo/core-design-patterns";
import type { Result } from "@monorepo/core-design-patterns";
// ============================================================================
// src/Pipeline/Behaviors/DraggingEnabledBehavior.ts
// ============================================================================

export class DraggingEnabledBehavior
    implements IBehavior<OnDragMessage, DragPipelineResult, DragPipelineResult> {
    private static readonly behaviorName = "DraggingEnabledBehavior";

    public constructor(
        private readonly stateStore: IDragStateStore
    ) { }

    public async execute(
        _ctx: IContextPipeline,
        msg: OnDragMessage
    ): Promise<Result<DragPipelineResult, DragPipelineResult>> {

        if (!this.stateStore.isDraggingEnabled()) {
            return Err(
                DragPipelineResult.fail(
                    DraggingEnabledBehavior.behaviorName,
                    `Dragging disabled for '${msg.payload.operation}'.`
                )
            );
        }

        return Ok(
            DragPipelineResult.ok(DraggingEnabledBehavior.behaviorName)
        );
    }
}
