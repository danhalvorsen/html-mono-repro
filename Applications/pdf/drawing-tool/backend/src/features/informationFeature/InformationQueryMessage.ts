import { IMessage } from '@monorepo/core-design-patterns-mediator';
import { InformationQuery } from './InformationQuery.js';


export class InformationQueryMessage<
  TPayload extends Record<string, unknown> = Record<string, unknown>
> implements IMessage {
  public readonly name = 'InformationQueryMessage';

  public constructor(public readonly payload: InformationQuery<TPayload>) { }
}
