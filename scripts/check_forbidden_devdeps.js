#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

async function findPackageJsons(root) {
  const results = [];
  async function walk(dir) {
    let entries;
    try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch (e) { return; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === 'node_modules' || e.name === '.git') continue;
        await walk(full);
      } else if (e.isFile() && e.name === 'package.json') {
        results.push(full);
      }
    }
  }
  await walk(root);
  return results;
}

async function main() {
  const root = path.resolve(process.argv[2] || '.');
  const cfgPath = path.join(root, 'scripts', 'codeql', 'forbidden-devdeps.json');
  let cfg = { forbidden: [] };
  try { cfg = JSON.parse(await fs.readFile(cfgPath, 'utf8')); } catch (e) { console.error('Failed to read config', cfgPath); process.exit(2); }

  const forbidden = new Set(cfg.forbidden || []);
  const files = await findPackageJsons(root);
  const report = [];
  for (const f of files) {
    // skip root package.json
    if (path.resolve(f) === path.resolve(root, 'package.json')) continue;
    let obj;
    try { obj = JSON.parse(await fs.readFile(f, 'utf8')); } catch (e) { continue; }
    const name = obj.name || f;
    const matches = [];
    const keys = ['dependencies','devDependencies','peerDependencies','optionalDependencies'];
    for (const k of keys) {
      const deps = obj[k] || {};
      for (const dep of Object.keys(deps)) {
        if (forbidden.has(dep)) matches.push({ type: k, dep, version: deps[dep] });
      }
    }
    // also check scripts for direct invocation
    if (obj.scripts) {
      for (const [s, cmd] of Object.entries(obj.scripts)) {
        for (const fdep of cfg.forbidden) if (typeof cmd === 'string' && cmd.includes(fdep)) matches.push({ type: 'script', script: s, cmd });
      }
    }
    if (matches.length) report.push({ file: f, name, matches });
  }

  const outPath = path.join(root, 'tmp', 'forbidden-devdeps-report.json');
  await fs.mkdir(path.join(root, 'tmp'), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(report, null, 2), 'utf8');
  console.log('WROTE', outPath);
  if (report.length) process.exit(1);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(2); });
