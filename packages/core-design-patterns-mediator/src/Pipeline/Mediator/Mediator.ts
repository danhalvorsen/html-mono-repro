import { INotificationBase, INotification } from "@monorepo/core-design-patterns-cqrs";
import { type Result, NonUndefined } from "@monorepo/core-design-patterns";
import { EventBus } from "../EventBus/EventBus.js";
import { Pipeline } from "../Pipeline.js";
import { PipelineContext } from "../Context/PipelineContext.js";
import { IBehaviorResult } from "../Behaviour/IBehaviorResult.js";
import { IMessage } from "../Messages/IMessage.js";

/* ============================================================================
 * Mediator (async context propagation + events)
 * ============================================================================ */

export class Mediator<
  TMsg extends IMessage,
  TResult,
  TBehaviorError extends IBehaviorResult = IBehaviorResult,
> {
  public constructor(
    private readonly pipeline: Pipeline<TMsg, TResult, TBehaviorError>,
    private readonly events?: EventBus,
  ) {}

  public async send(
    msg: TMsg,
    ctx: PipelineContext = new PipelineContext(),
  ): Promise<Result<TResult & NonUndefined, TBehaviorError & NonUndefined>> {
    const result = await this.pipeline.execute(ctx, msg);

    if (result.isOk() && this.events) {
      const evt: INotification<INotificationBase> = {
        json: JSON.stringify({ type: `${msg.name}.Handled`, payload: { name: msg.name } }),
      };
      await this.events.publish(evt);
    }

    return result;
  }
}
