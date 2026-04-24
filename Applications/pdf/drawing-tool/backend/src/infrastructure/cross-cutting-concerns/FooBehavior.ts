import { IBehavior, IBehaviorResult, IContextPipeline, IMessage } from "@monorepo/core-design-patterns-mediator";
import { Ok, Result } from "@monorepo/core-design-patterns";

class FooBehaviorOk implements IBehaviorResult {
  public readonly behavior = 'foo';
}

class FooBehaviorError implements IBehaviorResult {
  public readonly behavior = 'foo';

  public constructor(
    public readonly reason: string,
  ) {}
}

export class FooBehavior<TMsg extends IMessage>
  implements IBehavior<TMsg, FooBehaviorOk, FooBehaviorError>
{
  public async execute(
    _ctx: IContextPipeline,
    msg: TMsg,
  ): Promise<Result<FooBehaviorOk, FooBehaviorError>> {
    console.log('[SaveCommandPipeline][FooBehavior] execute', {
      message: msg.name,
    });
    return Ok<FooBehaviorOk, FooBehaviorError>(new FooBehaviorOk());
  }
}
