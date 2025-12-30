#!/usr/bin/env node
import { rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const steps = [
  {
    name: 'Clean node_modules',
    action: () => removePath(join(root, 'node_modules'))
  },
  {
    name: 'Clean .pnpm-store',
    action: () => removePath(join(root, '.pnpm-store'))
  },
  {
    name: 'Clean pnpm-lock.yaml',
    action: () => removePath(join(root, 'pnpm-lock.yaml'))
  },
  {
    name: 'Check workspace deps (node)',
    action: () => runCommand('node', ['scripts/check-workspace-deps.js'])
  },
  {
    name: 'Install dependencies',
    action: () => runCommand('pnpm', ['install', '--reporter=append-only'])
  },
  {
    name: 'Build workspace',
    action: () => runCommand('pnpm', ['build'])
  }
];

for (const step of steps) {
  console.log(`\n=== ${step.name} ===`);
  step.action();
}

function removePath(target) {
  if (existsSync(target)) {
    rmSync(target, { recursive: true, force: true });
    console.log(`removed ${target}`);
  } else {
    console.log(`skipped ${target} (not present)`);
  }
}

function runCommand(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    cwd: root,
    shell: process.platform === 'win32'
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} exited with code ${result.status}`);
  }
}
