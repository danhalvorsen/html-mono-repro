#!/usr/bin/env node
// apply-tsconfig-template.js
// Replace package-level tsconfig.json with a one-line extends to the repo root tsconfig.node.json
// Usage:
//   node scripts/apply-tsconfig-template.js        # dry-run (print planned changes)
//   node scripts/apply-tsconfig-template.js --apply  # actually write files

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const packagesDir = path.join(repoRoot, 'packages');
const tsconfigTemplateRelative = '../../tsconfig.node.json';
const skipPackages = new Set(['core-event-system']);

const args = process.argv.slice(2);
const doApply = args.includes('--apply');

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return null;
  }
}

function writeJson(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

function backup(file) {
  const bak = file + '.bak.' + Date.now();
  fs.copyFileSync(file, bak);
  return bak;
}

function findPackageDirs() {
  return fs.readdirSync(packagesDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => path.join(packagesDir, d.name));
}

function hasInversifyDeps(pkgJson) {
  if (!pkgJson) return false;
  const deps = Object.assign({}, pkgJson.dependencies || {}, pkgJson.devDependencies || {});
  return !!(deps['inversify'] || deps['reflect-metadata']);
}

function makeTsconfigBody() {
  return {
    extends: tsconfigTemplateRelative,
    compilerOptions: { rootDir: 'src', outDir: 'dist' },
    include: ['src']
  };
}

async function main() {
  console.log(`Repo root: ${repoRoot}`);
  console.log(doApply ? 'Apply mode: will write files' : 'Dry-run mode: no files will be changed');

  const pkgDirs = findPackageDirs();
  const planned = [];
  const skipped = [];

  for (const dir of pkgDirs) {
    const name = path.basename(dir);
    if (skipPackages.has(name)) {
      skipped.push({ name, reason: 'explicit skip' });
      continue;
    }

    const pkgJsonPath = path.join(dir, 'package.json');
    const tsconfigPath = path.join(dir, 'tsconfig.json');

    const pkgJson = readJson(pkgJsonPath);
    if (hasInversifyDeps(pkgJson)) {
      skipped.push({ name, reason: 'has inversify/reflect-metadata' });
      continue;
    }

    if (!fs.existsSync(tsconfigPath)) {
      skipped.push({ name, reason: 'no tsconfig.json' });
      continue;
    }

    planned.push({ name, dir, tsconfigPath });
  }

  if (planned.length === 0) {
    console.log('No packages found to update.');
    console.log('Skipped:', skipped.map(s => `${s.name} (${s.reason})`).join(', '));
    return;
  }

  console.log('Planned changes (packages):');
  for (const p of planned) console.log(' -', p.name);
  if (skipped.length) {
    console.log('\nSkipped packages:');
    for (const s of skipped) console.log(' -', s.name, ':', s.reason);
  }

  if (!doApply) {
    console.log('\nRun with `--apply` to write the changes.');
    return;
  }

  // Apply changes
  for (const p of planned) {
    const body = makeTsconfigBody();
    console.log(`Writing ${p.tsconfigPath} (backup created)`);
    try {
      backup(p.tsconfigPath);
      writeJson(p.tsconfigPath, body);
    } catch (e) {
      console.error('Failed to write', p.tsconfigPath, e);
    }
  }

  console.log('Done. All planned tsconfig.json files replaced.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
