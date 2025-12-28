import { createRequire } from 'node:module';
import path from 'node:path';
import {
  CliActionDefinition,
  CliRunner,
  CommandRegistry,
} from '@monorepo/core-console-cli';
import {
  type ValidationOutcome,
  ValidateTsconfigHandler,
} from './handlers/ValidateTsconfigHandler.js';
import { ComputeFingerprintHandler } from './handlers/ComputeFingerprintHandler.js';

export interface CoreConsistentCliDependencies {
  validateFile: (filePath: string) => { valid: boolean; errors?: unknown[] };
  computeFingerprint: (filePath: string) => string;
}

const requireCoreConsistent = createRequire(import.meta.url);
const coreConsistentBindings = {
  validateFile: (filePath: string) =>
    requireCoreConsistent('../src/tsconfig-validator.js').validateFile(filePath),
  computeFingerprint: (filePath: string) =>
    requireCoreConsistent('../src/index.js').computeXorFingerprintFromFile(filePath),
} satisfies CoreConsistentCliDependencies;

export type FilePayload = { file: string };

function normalizePath(value?: string): string | undefined {
  if (!value) return undefined;
  return path.resolve(value);
}

export function buildCommandDefinitions(
  dependencies: CoreConsistentCliDependencies = coreConsistentBindings
): CliActionDefinition<FilePayload, ValidationOutcome | string>[] {
  const validateHandler = new ValidateTsconfigHandler(dependencies.validateFile);
  const fingerprintHandler = new ComputeFingerprintHandler(dependencies.computeFingerprint);

  const validateDefinition: CliActionDefinition<FilePayload, ValidationOutcome> = {
    name: 'validate-tsconfig',
    description: 'Validate a tsconfig.json against the shared schema.',
    type: 'command',
    optionSchema: {
      file: { type: 'string', short: 'f' },
      tsconfig: { type: 'string', short: 't' },
    },
    buildPayload: (invocation) => {
      const candidate =
        invocation.options.file ??
        invocation.options.tsconfig ??
        invocation.positionals[0];
      const filePath = normalizePath(candidate as string | undefined);
      if (!filePath) {
        throw new Error('Please specify a tsconfig path (via --file or positional argument).');
      }
      return { file: filePath };
    },
    handler: validateHandler,
  };

  const fingerprintDefinition: CliActionDefinition<FilePayload, string> = {
    name: 'compute-fp',
    aliases: ['fingerprint'],
    description: 'Compute a compact XOR fingerprint for a tsconfig file.',
    type: 'command',
    optionSchema: {
      file: { type: 'string', short: 'f' },
    },
    buildPayload: (invocation) => {
      const candidate = invocation.options.file ?? invocation.positionals[0];
      const filePath = normalizePath(candidate as string | undefined);
      if (!filePath) {
        throw new Error('Provide a tsconfig file via --file or positional argument.');
      }
      return { file: filePath };
    },
    handler: fingerprintHandler,
  };

  return [validateDefinition, fingerprintDefinition];
}

export function createCliRunner(
  dependencies: Partial<CoreConsistentCliDependencies> = {},
  definitionsOverride?: CliActionDefinition<FilePayload, ValidationOutcome | string>[]
): CliRunner {
  const mergedDependencies = { ...coreConsistentBindings, ...dependencies } satisfies CoreConsistentCliDependencies;
  const definitions = definitionsOverride ?? buildCommandDefinitions(mergedDependencies);
  const registry = new CommandRegistry();
  definitions.forEach((definition) => registry.register(definition));
  return new CliRunner(registry);
}
