import { CliCommand } from '@monorepo/core-console-cli';
import type { CliCommandHandler } from '@monorepo/core-console-cli';

export interface ValidateTsconfigPayload {
  file: string;
}

interface AjvError {
  instancePath?: string;
  schemaPath?: string;
  message?: string;
}

export interface ValidationOutcome {
  path: string;
  valid: boolean;
  errors: string[];
}

function formatAjvError(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return String(error);
  }
  const ajvError = error as AjvError;
  const location = ajvError.instancePath || ajvError.schemaPath || '/';
  const message = ajvError.message || 'schema violation';
  return `${location} ${message}`.trim();
}

export class ValidateTsconfigHandler implements CliCommandHandler<ValidateTsconfigPayload, ValidationOutcome> {
  constructor(private readonly validateFn: (file: string) => { valid: boolean; errors?: unknown[] } = () => ({ valid: false, errors: [] })) {}

  async handle(command: CliCommand<ValidateTsconfigPayload>): Promise<ValidationOutcome> {
    const filePath = command.payload.file;
    const validation = this.validateFn(filePath);
    const errors = (validation.errors ?? []).map(formatAjvError);
    return {
      path: filePath,
      valid: validation.valid,
      errors,
    };
  }
}
