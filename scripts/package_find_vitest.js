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

function checkPkgJson(json) {
  const matches = [];
  const depKeys = ['dependencies','devDependencies','peerDependencies','optionalDependencies'];
  for (const k of depKeys) {
    if (json[k] && typeof json[k] === 'object' && json[k].vitest) {
      matches.push({ type: k, name: 'vitest', version: json[k].vitest });
    }
  }
  if (json.scripts && typeof json.scripts === 'object') {
    for (const [s, cmd] of Object.entries(json.scripts)) {
      if (typeof cmd === 'string' && /\bvitest\b/.test(cmd)) {
        matches.push({ type: 'script', script: s, cmd });
      }
    }
  }
  return matches;
}

async function main() {
  const argv = process.argv.slice(2);
  const rootArgIndex = argv.findIndex(a => a === '--root');
  const root = rootArgIndex >= 0 && argv[rootArgIndex+1] ? path.resolve(argv[rootArgIndex+1]) : process.cwd();
  const jsonOut = argv.includes('--json');

  const files = await findPackageJsons(root);
  const report = [];
  for (const f of files) {
    let raw;
    try { raw = await fs.readFile(f, 'utf8'); } catch (e) { continue; }
    let obj;
    try { obj = JSON.parse(raw); } catch (e) { continue; }
    const matches = checkPkgJson(obj);
    if (matches.length) report.push({ file: f, matches });
  }

  if (jsonOut) {
    console.log(JSON.stringify(report, null, 2));
    process.exit(report.length ? 1 : 0);
  }

  if (!report.length) { console.log('No vitest references found.'); return; }
  console.log('Found vitest references in the following package.json files:');
  for (const r of report) {
    console.log('\n' + r.file);
    for (const m of r.matches) console.log('  -', m.type, JSON.stringify(m));
  }
}

main().catch(err => { console.error(err); process.exit(2); });
