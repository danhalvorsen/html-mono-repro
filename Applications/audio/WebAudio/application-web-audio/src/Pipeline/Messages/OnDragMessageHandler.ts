import { IHandler, IContextPipeline } from "@monorepo/core-design-patterns-mediator";
import { IDragStateStore } from "../../Dragging/IDragStateStore";
import { OnDragMessage } from "./OnDragMessage";
import { DragPipelineResult } from "../Results/DragPipelineResult";

// ============================================================================
// src/Pipeline/Handlers/OnDragMessageHandler.ts
// ============================================================================

export class OnDragMessageHandler
    implements IHandler<OnDragMessage, DragPipelineResult> {
    public constructor(
        private readonly stateStore: IDragStateStore
    ) { }

    public async handle(
        _ctx: IContextPipeline,
        msg: OnDragMessage
    ): Promise<DragPipelineResult> {

        this.stateStore.record(msg);

        return DragPipelineResult.ok("OnDragMessageHandler");
    }
}
