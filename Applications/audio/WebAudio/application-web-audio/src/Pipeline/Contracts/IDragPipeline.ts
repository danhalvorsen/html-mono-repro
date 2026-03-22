import { DragPipelineResult } from "../Results/DragPipelineResult";
import { OnDragMessage } from "../Messages/OnDragMessage";

export interface IDragPipeline {
    send(message: OnDragMessage): Promise<DragPipelineResult>;
}
