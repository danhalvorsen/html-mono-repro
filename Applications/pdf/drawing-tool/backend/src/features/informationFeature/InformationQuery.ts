import type { IQueryBase } from '@monorepo/core-design-patterns-cqrs';

export class InformationQuery<TPayload extends Record<string, unknown> = Record<string, unknown>>
  implements IQueryBase
{
  public readonly type = 'information';

  public constructor(public readonly payload: TPayload) {}
}

