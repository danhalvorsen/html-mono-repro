#!/usr/bin/env node
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve, parse, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packagesDir = join(root, 'packages');

if (!readdirSync(packagesDir, { withFileTypes: true }).length) {
  console.error('No packages found under packages/');
  process.exit(1);
}

const workspaceNames = new Set();
const packages = [];

const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue;
    const resolved = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(resolved);
    } else if (entry.isFile() && entry.name === 'package.json') {
let content = readFileSync(resolved, 'utf8');
if (content.charCodeAt(0) === 0xfeff) {
  content = content.slice(1);
}
      try {
        const pkg = JSON.parse(content);
        packages.push({ dir: resolved, pkg });
        if (pkg.name) {
          workspaceNames.add(pkg.name);
        }
      } catch (err) {
        console.warn(`Skipping ${resolved}: ${err.message}`);
      }
    }
  }
};

walk(packagesDir);

const depKinds = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies'
];

const missing = [];

for (const { dir, pkg } of packages) {
  for (const kind of depKinds) {
    const deps = pkg[kind];
    if (!deps || typeof deps !== 'object') continue;

    for (const [depName, spec] of Object.entries(deps)) {
      if (typeof spec === 'string' && spec.startsWith('workspace:') && !workspaceNames.has(depName)) {
        missing.push({
          package: pkg.name || parse(dir).base,
          dep: depName,
          kind
        });
      }
    }
  }
}

if (!missing.length) {
  console.log('All workspace references resolve to existing packages.');
  process.exit(0);
}

console.error('Missing workspace packages:');
for (const entry of missing) {
  console.error(
    `  ${entry.package} -> ${entry.kind}: ${entry.dep}`
  );
}
process.exit(1);
