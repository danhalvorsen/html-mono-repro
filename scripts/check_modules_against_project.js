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
  const configPath = path.join(root, 'scripts', 'codeql', 'project-modules.json');
  let config = { allowed: {} };
  try { config = JSON.parse(await fs.readFile(configPath, 'utf8')); } catch (e) { console.error('Could not read config at', configPath); }

  const files = await findPackageJsons(root);
  const report = { extra: [] };
  for (const f of files) {
    if (path.resolve(f) === path.resolve(root, 'package.json')) continue;
    let obj;
    try { obj = JSON.parse(await fs.readFile(f, 'utf8')); } catch (e) { continue; }
    const name = obj.name;
    if (!name) continue;
    if (!Object.prototype.hasOwnProperty.call(config.allowed, name)) {
      report.extra.push({ file: f, name });
    }
  }

  const outPath = path.join(root, 'tmp', 'modules-against-project.json');
  await fs.mkdir(path.join(root, 'tmp'), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(report, null, 2), 'utf8');
  console.log('WROTE', outPath);
}

main().catch(e => { console.error(e); process.exit(2); });
