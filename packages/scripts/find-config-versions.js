#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const configs = [
  { label: 'package.json', path: 'package.json' },
  { label: 'tsconfig.json', path: 'tsconfig.json' },
  { label: 'tsconfig.test.json', path: 'tsconfig.test.json' },
  { label: 'vite.config.ts', path: 'vite.config.ts' },
  { label: 'vitest.config.ts', path: 'vitest.config.ts' },
];

const readFile = (relPath) => {
  const fullPath = path.join(root, relPath);
  try {
    return fs.readFileSync(fullPath, 'utf8');
  } catch (err) {
    return null;
  }
};

const parseJsonVersion = (text) => {
  try {
    const data = JSON.parse(text);
    return data.version ?? null;
  } catch {
    return null;
  }
};

const versionRegex = /version\s*[:=]\s*['"`]([^'"`]+)['"`]/gi;

const findVersionsInText = (text) => {
  if (!text) return [];
  const matches = new Set();
  let match;
  while ((match = versionRegex.exec(text))) {
    matches.add(match[1]);
  }
  return Array.from(matches);
};

const printConfigReport = () => {
  console.log('Config version report:');
  configs.forEach(({ label, path: relPath }) => {
    console.log(`\n- ${label} (${relPath}):`);
    const content = readFile(relPath);
    if (!content) {
      console.log('  • missing');
      return;
    }
    if (label === 'package.json') {
      const parsed = JSON.parse(content);
      console.log(`  • version: ${parsed.version ?? 'not set'}`);
      if (parsed.engines) {
        console.log(
          `  • engines: ${Object.entries(parsed.engines)
            .map(([key, value]) => `${key} ${value}`)
            .join(', ')}`
        );
      }
      if (parsed.devDependencies) {
        const subset = ['typescript', 'vite', 'vitest'];
        const found = subset
          .map((dep) => `${dep}: ${parsed.devDependencies[dep] ?? '—'}`)
          .join(', ');
        console.log(`  • key devDependencies: ${found}`);
      }
    } else if (relPath.endsWith('.json')) {
      try {
        const parsed = JSON.parse(content);
        const target = parsed.compilerOptions?.target ?? 'unset';
        const moduleOpt = parsed.compilerOptions?.module ?? 'unset';
        console.log(`  • compilerOptions.target: ${target}`);
        console.log(`  • compilerOptions.module: ${moduleOpt}`);
        const fileVersion = parsed.version ?? null;
        console.log(`  • version key: ${fileVersion ?? 'none'}`);
      } catch {
        console.log('  • invalid JSON');
      }
    } else {
      const versions = findVersionsInText(content);
      if (versions.length === 0) {
        console.log('  • version pattern: none found');
      } else {
        console.log(`  • version pattern: ${versions.join(', ')}`);
      }
    }
  });
};

printConfigReport();
