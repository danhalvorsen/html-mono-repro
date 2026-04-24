import { IBehavior, IBehaviorResult, IContextPipeline, IMessage } from "@monorepo/core-design-patterns-mediator";
import { Ok, Result } from "@monorepo/core-design-patterns";

class BlaBehaviorOk implements IBehaviorResult {
  public readonly behavior = "bla";
}

class BlaBehaviorError implements IBehaviorResult {
  public readonly behavior = "bla";

  public constructor(
    public readonly reason: string,
  ) {}
}

export class BlaBehavior<TMsg extends IMessage>
  implements IBehavior<TMsg, BlaBehaviorOk, BlaBehaviorError>
{
  public async execute(
    _ctx: IContextPipeline,
    msg: TMsg,
  ): Promise<Result<BlaBehaviorOk, BlaBehaviorError>> {
    console.log('[SaveCommandPipeline][BlaBehavior] execute', {
      message: msg.name,
    });
    return Ok<BlaBehaviorOk, BlaBehaviorError>(new BlaBehaviorOk());
  }
}
