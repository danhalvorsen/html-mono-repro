import { IHandler, IContextPipeline } from "@monorepo/core-design-patterns-mediator";
 
import { OnDragMessage } from "./OnDragMessage";
import { DragPipelineResult } from "../Results/DragPipelineResult";

// ============================================================================
// src/Pipeline/Handlers/OnDragMessageHandler.ts
// ============================================================================

export class OnDragMessageHandler
    implements IHandler<OnDragMessage, DragPipelineResult> {
    public constructor(
       
    ) { }

    public async handle(
        _ctx: IContextPipeline,
        msg: OnDragMessage
    ): Promise<DragPipelineResult> {

        return DragPipelineResult.ok("OnDragMessageHandler");
    }
}
