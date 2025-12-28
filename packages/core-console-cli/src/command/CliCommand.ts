import type { ICommand } from './contracts.js';

export class CliCommand<TPayload> implements ICommand<TPayload> {
  constructor(public readonly commandName: string, public readonly payload: TPayload) {}
}
