#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

async function writeJson(file, obj) {
  await fs.writeFile(file, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

function isIgnored(name) {
  return name === 'node_modules' || name === '.git' || name === 'dist' || name === 'coverage';
}

async function findPackageJsons(dir, out = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (isIgnored(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      await findPackageJsons(full, out);
    } else if (e.isFile() && e.name === 'package.json') {
      out.push(full);
    }
  }
  return out;
}

function usage() {
  console.log('Usage: node update-vitest-versions.js [--apply] [--root <path>] [--filter <substr>]');
  console.log('\nOptions:\n  --apply       Actually write changes (default: dry-run)\n  --root <p>    Repo root containing root package.json (default: parent of scripts dir)\n  --filter <s>  Only include package.json paths containing this substring\n');
}

(async function main(){
  const argv = process.argv.slice(2);
  const apply = argv.includes('--apply');
  if (argv.includes('--help') || argv.includes('-h')) return usage();

  const rootIndex = argv.indexOf('--root');
  const filterIndex = argv.indexOf('--filter');
  const rootDir = rootIndex >= 0 ? path.resolve(argv[rootIndex+1]) : path.resolve(__dirname, '..');
  const filter = filterIndex >= 0 ? argv[filterIndex+1] : null;

  const rootPkgPath = path.join(rootDir, 'package.json');
  let rootPkg;
  try {
    rootPkg = await readJson(rootPkgPath);
  } catch (err) {
    console.error('Cannot read root package.json at', rootPkgPath);
    process.exit(2);
  }

  const candidates = Object.assign({}, rootPkg.dependencies || {}, rootPkg.devDependencies || {});
  const vitestMap = {};
  for (const k of Object.keys(candidates)) {
    if (k === 'vitest' || k.startsWith('@vitest/')) vitestMap[k] = candidates[k];
  }

  if (Object.keys(vitestMap).length === 0) {
    console.log('No vitest entries found in root package.json dependencies/devDependencies. Nothing to do.');
    return;
  }

  console.log('Root vitest versions to enforce:');
  for (const k of Object.keys(vitestMap)) console.log('  ', k, '->', vitestMap[k]);

  const searchStart = rootDir; // search whole repo under root
  const pkgFiles = await findPackageJsons(searchStart);
  const filtered = pkgFiles.filter(p => path.resolve(p) !== path.resolve(rootPkgPath) && (!filter || p.includes(filter)));

  const updates = [];
  for (const pkgPath of filtered) {
    let pkg;
    try {
      pkg = await readJson(pkgPath);
    } catch (err) {
      console.warn('Skipping unreadable', pkgPath);
      continue;
    }
    const changed = { path: pkgPath, updates: [] };
    for (const depField of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
      if (!pkg[depField]) continue;
      for (const k of Object.keys(vitestMap)) {
        if (Object.prototype.hasOwnProperty.call(pkg[depField], k)) {
          const current = pkg[depField][k];
          const target = vitestMap[k];
          if (current !== target) {
            changed.updates.push({ field: depField, name: k, from: current, to: target });
            pkg[depField][k] = target;
          }
        }
      }
    }
    if (changed.updates.length) updates.push({ pkgPath, pkg, changes: changed.updates });
  }

  if (updates.length === 0) {
    console.log('No package.json files need vitest version updates.');
    return;
  }

  console.log('\nFound', updates.length, 'package.json files to update:');
  for (const u of updates) {
    console.log(' -', u.pkgPath);
    for (const ch of u.changes) {
      console.log('    *', ch.name, ch.field, ch.from, '->', ch.to);
    }
  }

  if (!apply) {
    console.log('\nDry-run mode (no files changed). Run with --apply to write changes.');
    process.exit(0);
  }

  // apply changes with backups
  const now = new Date().toISOString().replace(/[:.]/g,'-');
  for (const u of updates) {
    const backupPath = u.pkgPath + '.bak.' + now;
    await fs.copyFile(u.pkgPath, backupPath);
    await writeJson(u.pkgPath, u.pkg);
    console.log('Updated', u.pkgPath, '(backup: ' + backupPath + ')');
  }

  console.log('\nDone. Consider running `pnpm -w install` or per-package installs to sync lockfile.');
})();
