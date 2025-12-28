import { CliCommand } from '@monorepo/core-console-cli';
import type { CliCommandHandler } from '@monorepo/core-console-cli';

export interface ComputeFingerprintPayload {
  file: string;
}

export class ComputeFingerprintHandler implements CliCommandHandler<ComputeFingerprintPayload, string> {
  constructor(private readonly fingerprintFn: (file: string) => string = () => '') {}

  async handle(command: CliCommand<ComputeFingerprintPayload>): Promise<string> {
    return this.fingerprintFn(command.payload.file);
  }
}
