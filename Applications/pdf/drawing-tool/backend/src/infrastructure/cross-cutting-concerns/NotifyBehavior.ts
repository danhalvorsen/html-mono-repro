// Example: behavior owns notification (NOT context)

// Applications/pdf/drawing-tool/backend/src/infrastructure/behaviors/NotifyBehavior.ts

import { Ok, type Result } from '@monorepo/core-design-patterns';
import type { IBehavior } from '@monorepo/core-design-patterns-mediator';
import type { IContextPipeline } from '@monorepo/core-design-patterns-mediator';
import type { IMessage } from '@monorepo/core-design-patterns-mediator';
import type { IBehaviorResult } from '@monorepo/core-design-patterns-mediator';
import type { INotification, INotificationBase } from '@monorepo/core-design-patterns-cqrs';
import { EventBus } from '@monorepo/core-design-patterns-mediator';

class NotifyOk implements IBehaviorResult {
  public readonly behavior = 'notify';
}

class NotifyError implements IBehaviorResult {
  public readonly behavior = 'notify';
}

export class NotifyBehavior<TMsg extends IMessage>
  implements IBehavior<TMsg, NotifyOk, NotifyError> {

  public constructor(
    private readonly eventBus: EventBus,
  ) {}

  public async execute(
    _ctx: IContextPipeline,
    msg: TMsg,
  ): Promise<Result<NotifyOk, NotifyError>> {

    const evt: INotification<INotificationBase> = {
      json: JSON.stringify({
        type: `${msg.name}.Started`,
      }),
    };

    await this.eventBus.publish(evt);

    return Ok<NotifyOk, NotifyError>(new NotifyOk());
  }
}
