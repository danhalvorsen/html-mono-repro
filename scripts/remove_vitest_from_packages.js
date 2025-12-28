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
  const files = await findPackageJsons(root);
  const rootPkg = path.join(root, 'package.json');
  const modified = [];

  for (const f of files) {
    if (path.resolve(f) === path.resolve(rootPkg)) continue; // skip root
    let raw;
    try { raw = await fs.readFile(f, 'utf8'); } catch (e) { continue; }
    let obj;
    try { obj = JSON.parse(raw); } catch (e) { continue; }
    if (obj.devDependencies && Object.prototype.hasOwnProperty.call(obj.devDependencies, 'vitest')) {
      delete obj.devDependencies.vitest;
      // if devDependencies empty, delete the key to keep files tidy
      if (Object.keys(obj.devDependencies).length === 0) delete obj.devDependencies;
      await fs.writeFile(f, JSON.stringify(obj, null, 2) + '\n', 'utf8');
      modified.push(f);
    }
  }

  const out = {
    root: root,
    modifiedCount: modified.length,
    modifiedFiles: modified
  };
  const outPath = path.join(root, 'tmp', 'remove-vitest-report.json');
  try { await fs.mkdir(path.join(root, 'tmp'), { recursive: true }); } catch (e) {}
  await fs.writeFile(outPath, JSON.stringify(out, null, 2), 'utf8');
  console.log(`WROTE:${outPath}`);
  if (modified.length) process.exit(0);
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(2); });
