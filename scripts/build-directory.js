#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const [,, dirArg] = process.argv;

if (!dirArg) {
  console.error('Usage: node scripts/build-directory.js <relative-package-path>');
  process.exit(1);
}

const root = resolve('.');
const target = resolve(root, dirArg);

console.log(`Running pnpm build in ${target}`);

const result = spawnSync('pnpm', ['build'], {
  cwd: target,
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

if (result.status !== 0) {
  process.exit(result.status);
}
