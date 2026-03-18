import {
  Pipeline,
  PipelineContext,
  type IContextPipeline,
  type IHandler,
} from "@monorepo/core-design-patterns-mediator";

import { IDragPipeline } from "../Pipeline/Contracts/IDragPipeline.js";
import { OnDragMessage } from "../Pipeline/Messages/OnDragMessage.js";
import { DragPipelineResult } from "../Pipeline/Results/DragPipelineResult.js";
import { RectangleConstraintsBehaviour } from "../Pipeline/Behavior/RectangleConstraintsBehaviour.js";
import { VisibleBehavior } from "../Pipeline/Behavior/VisibleBehavior.js";

export class DragPipeline implements IDragPipeline {
  private readonly pipeline: Pipeline<
    OnDragMessage,
    DragPipelineResult,
    DragPipelineResult
  >;

  private readonly context: IContextPipeline;

  public constructor(
    handler: IHandler<OnDragMessage, DragPipelineResult>,
    context?: IContextPipeline,
  ) {
    this.pipeline = new Pipeline<
      OnDragMessage,
      DragPipelineResult,
      DragPipelineResult
    >(
      [
 
        new RectangleConstraintsBehaviour(),
      ],
      handler,
    );

    this.context = context ?? new PipelineContext();
  }

  public async send(message: OnDragMessage): Promise<DragPipelineResult> {
    const result = await this.pipeline.execute(this.context, message);
    return result.isOk() ? result.unwrap() : result.unwrapErr();
  }
}