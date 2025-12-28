import type { IQuery } from './contracts.js';

export class CliQuery<TPayload> implements IQuery<TPayload> {
  constructor(public readonly commandName: string, public readonly payload: TPayload) {}
}
