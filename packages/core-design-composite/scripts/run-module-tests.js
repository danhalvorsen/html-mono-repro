import { spawn } from 'node:child_process';

const moduleName = 'core-design-patterns';
const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const child = spawn(
  pnpmCommand,
  ['--workspace-root', 'vitest', '--config', 'vitest.config.ts'],
  {
    stdio: 'inherit',
    env: { ...process.env, VITEST_MODULE: moduleName }
  }
);

child.on('close', (code) => process.exit(code));
