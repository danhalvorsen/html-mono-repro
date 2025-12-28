#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const configPath = path.join(__dirname, 'build-exclude.config.json');
let config = { exclude: [] };
if (fs.existsSync(configPath)) {
  try { config = JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch (e) { console.error('Failed to parse config:', e); process.exit(2); }
}

console.log('Using build-exclude config, excluding:', config.exclude);

function findPackageJsons(dir) {
  const results = [];
  function walk(d) {
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) {
        if (['node_modules', 'dist', '.git'].includes(e.name)) continue;
        walk(full);
      } else if (e.isFile() && e.name === 'package.json') {
        results.push(full);
      }
    }
  }
  walk(dir);
  return results;
}

const pkgFiles = findPackageJsons(root);
// skip root package.json
const packages = pkgFiles
  .map(p => ({ path: p, dir: path.dirname(p), pkg: JSON.parse(fs.readFileSync(p, 'utf8')) }))
  .filter(x => path.resolve(x.path) !== path.resolve(path.join(root, 'package.json')))
  .map(x => ({ name: x.pkg.name || path.basename(x.dir), dir: x.dir }));

const toBuild = packages.filter(p => !config.exclude.includes(p.name));
if (!toBuild.length) { console.log('No packages to build after exclusion. Exiting.'); process.exit(0); }

for (const p of toBuild) {
  console.log('\n== Building', p.name, '(@', p.dir, ') ==');
  // run pnpm --filter <name> run build
  const res = spawnSync('pnpm', ['--filter', p.name, 'run', 'build'], { stdio: 'inherit', cwd: root, shell: process.platform === 'win32' });
  if (res.status !== 0) {
    console.error(`Build failed for ${p.name} (exit ${res.status}). Aborting.`);
    process.exit(res.status || 1);
  }
}

console.log('\nAll selected packages built successfully.');