#!/usr/bin/env node
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function collectPackageDirs(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const packages = [];

  for (const entry of entries) {
    const resolved = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.pnpm')) {
        continue;
      }
      const pkgJson = join(resolved, 'package.json');
      if (existsSync(pkgJson)) {
        packages.push(resolved);
        continue;
      }
    }
  }
  return packages;
}

const packagesDir = join(root, 'packages');
const packageDirs = collectPackageDirs(packagesDir);

const report = {
  generatedAt: new Date().toISOString(),
  nodeVersion: process.version,
  packages: []
};

for (const pkgDir of packageDirs) {
  const pkgDataPath = join(pkgDir, 'package.json');
  let pkg;
  try {
    const raw = readFileSync(pkgDataPath, 'utf8');
    pkg = JSON.parse(raw);
  } catch (error) {
    console.warn(`Skipping ${pkgDir}: ${error.message}`);
    continue;
  }

  const name = pkg.name || pkgDir;
  console.log(`\nBuilding ${name} (${pkgDir})`);

  const result = spawnSync(
    'pnpm',
    ['--filter', name, 'build'],
    {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    }
  );

  const output = (result.stdout || '') + (result.stderr || '');

  const entry = {
    name,
    directory: relative(root, pkgDir),
    status: result.status === 0 ? 'success' : 'failed',
    exitCode: result.status,
    output: output.trim()
  };

  if (result.status !== 0) {
    console.error(`Build failed for ${name}, exit code ${result.status}`);
  }

  report.packages.push(entry);
}

await writeFile(join(root, 'build.report.json'), JSON.stringify(report, null, 2), 'utf8');
console.log(`\nReport written to ${join(root, 'build.report.json')}`);
