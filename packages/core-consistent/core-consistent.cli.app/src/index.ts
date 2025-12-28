import { CliExecutionResult, type CliActionDefinition } from '@monorepo/core-console-cli';
import { createCliRunner, buildCommandDefinitions, type FilePayload } from './app.js';
import type { ValidationOutcome } from './handlers/ValidateTsconfigHandler.js';

const definitions = buildCommandDefinitions();
const runner = createCliRunner({}, definitions);

const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  printUsage(definitions);
  process.exit(0);
} else {
  void execute(args);
}

async function execute(argumentsList: string[]) {
  try {
    const execution = await runner.executeArgs(argumentsList);
    reportExecution(execution);
  } catch (error) {
    console.error('[ERROR]', error instanceof Error ? error.message : 'Unknown failure');
    process.exitCode = 1;
  }
}

function reportExecution(execution: CliExecutionResult<FilePayload, unknown>) {
  if (execution.definition.name === 'validate-tsconfig') {
    const outcome = execution.result as ValidationOutcome;
    console.log(outcome.valid ? '[OK] tsconfig is valid' : '[FAIL] tsconfig validation failed');
    if (!outcome.valid && outcome.errors.length > 0) {
      outcome.errors.forEach((err) => console.error('  ' + err));
      process.exitCode = 1;
    }
    return;
  }

  if (execution.definition.name === 'compute-fp') {
    const fingerprint = execution.result as string;
    console.log(`[INFO] fingerprint for ${execution.payload.file}: ${fingerprint}`);
    return;
  }

  console.log('[INFO] Command executed', execution.definition.name);
}

function printUsage(commandDefinitions: CliActionDefinition<FilePayload, ValidationOutcome | string>[]) {
  console.log('Usage: core-consistent.cli.app <command> [options]');
  console.log('Commands:');
  for (const def of commandDefinitions) {
    const aliasSuffix = def.aliases && def.aliases.length ? ` (aliases: ${def.aliases.join(', ')})` : '';
    console.log(`  ${def.name.padEnd(20)} ${def.description}${aliasSuffix}`);
  }
}
