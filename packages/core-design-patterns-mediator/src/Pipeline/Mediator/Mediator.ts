import { INotificationBase, INotification } from "@monorepo/core-design-patterns-cqrs";
import { type Result, Err, NonUndefined, Ok } from "@monorepo/core-design-patterns";
import { EventBus } from "../EventBus/EventBus.js";
import { Pipeline } from "../Pipeline.js";
import { PipelineContext } from "../Context/PipelineContext.js";
import { IMessage } from "../Messages/IMessage.js";

/* ============================================================================
 * Mediator (async context propagation + events)
 * ============================================================================ */

export class Mediator<TMsg extends IMessage, TResult> {
  public constructor(
    private readonly pipeline: Pipeline<TMsg, TResult>,
    private readonly events?: EventBus
  ) { }

  public async send(
    msg: TMsg,
    ctx: PipelineContext = new PipelineContext()
  ): Promise<Result<TResult & NonUndefined, NonUndefined>> {
    const result = await this.pipeline.execute(ctx, msg);

    if (result.isOk() && this.events) {
      const evt: INotification<INotificationBase> = {
        json: JSON.stringify({ type: `${msg.name}.Handled`, payload: { name: msg.name } }),
      };
      await this.events.publish(evt);
    }

    return result as unknown as Result<TResult & NonUndefined, NonUndefined>;
  }
}
